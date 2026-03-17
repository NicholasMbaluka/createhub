// Payout Controller - Handle creator payout operations
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Payout = require('../models/Payout');
const Transaction = require('../models/Transaction');
const { createNotification } = require('../utils/notifications');

class PayoutController {
  
  // Get available balance for creator
  static async getAvailableBalance(req, res) {
    try {
      const creatorId = req.user._id;
      
      // Calculate available balance (completed sales minus pending payouts)
      const completedTransactions = await Transaction.find({
        type: 'sale',
        status: 'completed',
        createdAt: { $lte: new Date() }
      });
      
      const pendingPayouts = await Payout.find({
        creatorId,
        status: { $in: ['pending', 'processing'] }
      });
      
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.netAmount, 0);
      const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
      const availableBalance = totalRevenue - pendingAmount;
      
      res.json({
        success: true,
        balance: {
          totalRevenue,
          pendingPayouts: pendingAmount,
          availableBalance,
          currency: 'USD'
        }
      });
      
    } catch (error) {
      console.error('Balance calculation error:', error);
      res.status(500).json({ success: false, message: 'Failed to calculate balance' });
    }
  }
  
  // Create payout request
  static async requestPayout(req, res) {
    try {
      const { amount, payoutMethodId } = req.body;
      const creatorId = req.user._id;
      
      // Validate minimum payout amount
      if (amount < 10) {
        return res.status(400).json({ 
          success: false, 
          message: 'Minimum payout amount is $10' 
        });
      }
      
      // Get available balance
      const balanceResult = await PayoutController.getAvailableBalanceInternal(creatorId);
      if (amount > balanceResult.availableBalance) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient available balance' 
        });
      }
      
      // Get payout method
      const user = await User.findById(creatorId);
      const payoutMethod = user.payoutMethods.find(pm => pm.id === payoutMethodId);
      
      if (!payoutMethod) {
        return res.status(400).json({ 
          success: false, 
          message: 'Payout method not found' 
        });
      }
      
      // Create payout record
      const payout = await Payout.create({
        creatorId,
        amount,
        payoutMethodId,
        status: 'pending',
        currency: 'USD',
        requestedAt: new Date(),
        processingFee: 0, // Stripe Connect fees apply
        netAmount: amount
      });
      
      // Notify creator
      await createNotification(creatorId, {
        type: 'payout_requested',
        title: 'Payout requested',
        body: `Your payout request for $${amount.toFixed(2)} has been submitted for processing`,
        metadata: { payoutId: payout._id }
      });
      
      res.json({
        success: true,
        message: 'Payout request submitted successfully',
        payout: {
          id: payout._id,
          amount,
          status: 'pending',
          estimatedProcessing: '3-5 business days'
        }
      });
      
    } catch (error) {
      console.error('Payout request error:', error);
      res.status(500).json({ success: false, message: 'Failed to request payout' });
    }
  }
  
  // Process payout via Stripe Connect
  static async processPayout(payoutId) {
    try {
      const payout = await Payout.findById(payoutId).populate('creatorId');
      
      if (!payout || payout.status !== 'pending') {
        return;
      }
      
      // Update status to processing
      payout.status = 'processing';
      payout.processingStartedAt = new Date();
      await payout.save();
      
      // Create Stripe Connect transfer
      const transfer = await stripe.transfers.create({
        amount: Math.round(payout.netAmount * 100), // Convert to cents
        currency: 'usd',
        destination: payout.creatorId.stripeAccountId,
        metadata: {
          payoutId: payoutId.toString()
        }
      });
      
      // Update payout with transfer details
      payout.stripeTransferId = transfer.id;
      payout.status = 'completed';
      payout.completedAt = new Date();
      payout.arrivalDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
      await payout.save();
      
      // Notify creator
      await createNotification(payout.creatorId._id, {
        type: 'payout_completed',
        title: 'Payout completed',
        body: `Your payout of $${payout.amount.toFixed(2)} has been processed and will arrive in 3-5 business days`,
        metadata: { payoutId: payout._id }
      });
      
      console.log(`Payout ${payoutId} processed successfully`);
      
    } catch (error) {
      console.error(`Payout processing error for ${payoutId}:`, error);
      
      // Mark as failed
      await Payout.findByIdAndUpdate(payoutId, {
        status: 'failed',
        failureReason: error.message,
        failedAt: new Date()
      });
    }
  }
  
  // Get payout history
  static async getPayoutHistory(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const creatorId = req.user._id;
      
      const query = { creatorId };
      if (status) query.status = status;
      
      const payouts = await Payout.find(query)
        .sort({ requestedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      
      const total = await Payout.countDocuments(query);
      
      res.json({
        success: true,
        payouts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      console.error('Payout history error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payout history' });
    }
  }
  
  // Get payout methods
  static async getPayoutMethods(req, res) {
    try {
      const user = await User.findById(req.user._id);
      
      res.json({
        success: true,
        payoutMethods: user.payoutMethods || []
      });
      
    } catch (error) {
      console.error('Get payout methods error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payout methods' });
    }
  }
  
  // Add payout method
  static async addPayoutMethod(req, res) {
    try {
      const { type, details } = req.body;
      const userId = req.user._id;
      
      // Validate payout method
      if (type === 'bank') {
        const { accountNumber, routingNumber, accountHolderName } = details;
        if (!accountNumber || !routingNumber || !accountHolderName) {
          return res.status(400).json({ 
            success: false, 
            message: 'Missing required bank details' 
          });
        }
      }
      
      if (type === 'paypal') {
        const { email } = details;
        if (!email || !email.includes('@')) {
          return res.status(400).json({ 
            success: false, 
            message: 'Valid PayPal email required' 
          });
        }
      }
      
      const user = await User.findById(userId);
      if (!user.payoutMethods) user.payoutMethods = [];
      
      const newMethod = {
        id: new Date().getTime().toString(),
        type,
        details,
        isDefault: user.payoutMethods.length === 0,
        createdAt: new Date()
      };
      
      user.payoutMethods.push(newMethod);
      await user.save();
      
      res.json({
        success: true,
        message: 'Payout method added successfully',
        payoutMethod: newMethod
      });
      
    } catch (error) {
      console.error('Add payout method error:', error);
      res.status(500).json({ success: false, message: 'Failed to add payout method' });
    }
  }
  
  // Update payout method
  static async updatePayoutMethod(req, res) {
    try {
      const { methodId, updates } = req.body;
      const userId = req.user._id;
      
      const user = await User.findById(userId);
      const methodIndex = user.payoutMethods.findIndex(pm => pm.id === methodId);
      
      if (methodIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          message: 'Payout method not found' 
        });
      }
      
      // Update method
      Object.assign(user.payoutMethods[methodIndex], updates);
      await user.save();
      
      res.json({
        success: true,
        message: 'Payout method updated successfully',
        payoutMethod: user.payoutMethods[methodIndex]
      });
      
    } catch (error) {
      console.error('Update payout method error:', error);
      res.status(500).json({ success: false, message: 'Failed to update payout method' });
    }
  }
  
  // Delete payout method
  static async deletePayoutMethod(req, res) {
    try {
      const { methodId } = req.params;
      const userId = req.user._id;
      
      const user = await User.findById(userId);
      user.payoutMethods = user.payoutMethods.filter(pm => pm.id !== methodId);
      await user.save();
      
      res.json({
        success: true,
        message: 'Payout method deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete payout method error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete payout method' });
    }
  }
  
  // Get payout analytics
  static async getPayoutAnalytics(req, res) {
    try {
      const creatorId = req.user._id;
      const { period = '30d' } = req.query;
      
      const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const payouts = await Payout.find({
        creatorId,
        requestedAt: { $gte: since }
      });
      
      const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
      const completedPayouts = payouts.filter(p => p.status === 'completed');
      const pendingPayouts = payouts.filter(p => p.status === 'pending');
      
      const totalCompleted = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
      const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
      
      // Monthly payout trend
      const monthlyPayouts = {};
      payouts.forEach(payout => {
        const month = payout.requestedAt.toISOString().slice(0, 7); // YYYY-MM
        monthlyPayouts[month] = (monthlyPayouts[month] || 0) + payout.amount;
      });
      
      const chartData = Object.entries(monthlyPayouts)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month));
      
      res.json({
        success: true,
        analytics: {
          totalPayouts,
          totalCompleted,
          totalPending,
          completedCount: completedPayouts.length,
          pendingCount: pendingPayouts.length,
          chartData,
          period
        }
      });
      
    } catch (error) {
      console.error('Payout analytics error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payout analytics' });
    }
  }
  
  // Internal helper method
  static async getAvailableBalanceInternal(creatorId) {
    const completedTransactions = await Transaction.find({
      type: 'sale',
      status: 'completed',
      createdAt: { $lte: new Date() }
    });
    
    const pendingPayouts = await Payout.find({
      creatorId,
      status: { $in: ['pending', 'processing'] }
    });
    
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.netAmount, 0);
    const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
    
    return {
      totalRevenue,
      pendingAmount,
      availableBalance: totalRevenue - pendingAmount
    };
  }
}

module.exports = PayoutController;
