const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

// @desc  Get KYC status
// @route GET /api/kyc
// @access Private
const getKYCStatus = async (req, res) => {
  res.json({ success: true, kyc: req.user.kyc });
};

// @desc  Submit KYC application
// @route POST /api/kyc/submit
// @access Private (creator)
const submitKYC = async (req, res) => {
  try {
    const { documentType, personalInfo } = req.body;
    const user = await User.findById(req.user._id);

    if (user.kyc.status === 'verified') {
      return res.status(400).json({ success: false, message: 'KYC already verified' });
    }

    // Update KYC status and info
    user.kyc.status = 'pending';
    user.kyc.documentType = documentType;
    user.kyc.personalInfo = personalInfo;
    user.kyc.submittedAt = new Date();
    await user.save();

    // Notify admins
    await createNotification(user._id, {
      type: 'kyc',
      title: 'KYC Submitted',
      body: 'Your identity verification has been submitted for review.',
    });

    res.json({ success: true, message: 'KYC application submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get pending KYC applications
// @route GET /api/kyc/admin/pending
// @access Private (admin)
const getPendingKYC = async (req, res) => {
  try {
    const pendingUsers = await User.find({ 'kyc.status': 'pending' })
      .select('name email kyc')
      .sort({ 'kyc.submittedAt': -1 });

    res.json({ success: true, pendingKYC: pendingUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Approve KYC application
// @route PUT /api/kyc/admin/:userId/approve
// @access Private (admin)
const approveKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user || user.kyc.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'KYC application not found' });
    }

    user.kyc.status = 'verified';
    user.kyc.approvedAt = new Date();
    await user.save();

    // Notify user
    await createNotification(userId, {
      type: 'kyc',
      title: 'KYC Approved',
      body: 'Your identity has been verified. You now have full platform access.',
    });

    res.json({ success: true, message: 'KYC application approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Reject KYC application
// @route PUT /api/kyc/admin/:userId/reject
// @access Private (admin)
const rejectKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const user = await User.findById(userId);

    if (!user || user.kyc.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'KYC application not found' });
    }

    user.kyc.status = 'rejected';
    user.kyc.rejectedAt = new Date();
    user.kyc.rejectionReason = reason;
    await user.save();

    // Notify user
    await createNotification(userId, {
      type: 'kyc',
      title: 'KYC Rejected',
      body: `Your identity verification was rejected: ${reason}`,
    });

    res.json({ success: true, message: 'KYC application rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getKYCStatus,
  submitKYC,
  getPendingKYC,
  approveKYC,
  rejectKYC,
};
