/* ═══════════════════════════════════════════════
   CreateHub — Subscription Plans Page
   Display and manage CreateHub subscription plans
   ═══════════════════════════════════════════════ */

const PlansPage = {
  // Render the plans page
  render: async () => {
    const user = S.user;
    const isCreator = user?.role === 'creator';
    
    try {
      // Get available plans and current subscription status
      const [plansRes, statusRes] = await Promise.all([
        API.subscriptions.getPlans(),
        isCreator ? API.subscriptions.getStatus() : Promise.resolve(null)
      ]);
      
      const plans = plansRes.plans;
      const currentPlan = statusRes?.subscription?.plan || 'starter';
      const currentStatus = statusRes?.subscription?.status || 'active';
      
      return `
        <div class="page">
          <div class="page-header">
            <h1 class="page-title">CreateHub Plans</h1>
            <p class="page-subtitle">Choose the perfect plan for your creator journey</p>
          </div>
          
          ${isCreator && statusRes ? PlansPage.renderCurrentPlan(currentPlan, currentStatus, statusRes.planDetails) : ''}
          
          <div class="pricing-grid">
            ${Object.entries(plans).map(([planKey, plan]) => 
              PlansPage.renderPlanCard(planKey, plan, currentPlan, currentStatus, isCreator)
            ).join('')}
          </div>
          
          <div class="plan-comparison">
            <h2>Compare Plans</h2>
            <div class="comparison-table">
              ${PlansPage.renderComparisonTable(plans)}
            </div>
          </div>
          
          <div class="faq-section">
            <h2>Frequently Asked Questions</h2>
            ${PlansPage.renderFAQ()}
          </div>
        </div>
      `;
    } catch (err) {
      console.error('Error loading plans:', err);
      return `
        <div class="page">
          <div class="error-state">
            <h3>Unable to load plans</h3>
            <p>Please try again later.</p>
            <button class="btn primary" onclick="location.reload()">Reload</button>
          </div>
        </div>
      `;
    }
  },

  // Render current plan status for creators
  renderCurrentPlan: (currentPlan, currentStatus, planDetails) => {
    const isActive = currentStatus === 'active';
    const isCancelled = currentStatus === 'cancelled';
    
    return `
      <div class="current-plan-card">
        <div class="current-plan-info">
          <h3>Current Plan: ${planDetails.name}</h3>
          <p class="plan-status ${currentStatus}">
            Status: ${isActive ? '✅ Active' : isCancelled ? '🔄 Cancelled' : '⚠️ ' + currentStatus}
          </p>
          ${planDetails.price > 0 ? `<p class="plan-price">$${planDetails.price}/month</p>` : ''}
        </div>
        ${currentPlan !== 'starter' && isActive ? `
          <button class="btn outline" onclick="PlansPage.handleCancelPlan()">
            Cancel Plan
          </button>
        ` : ''}
      </div>
    `;
  },

  // Render individual plan card
  renderPlanCard: (planKey, plan, currentPlan, currentStatus, isCreator) => {
    const isCurrentPlan = planKey === currentPlan;
    const isPopular = planKey === 'pro';
    const canUpgrade = isCreator && !isCurrentPlan && currentStatus === 'active';
    
    return `
      <div class="pricing-card ${isCurrentPlan ? 'current' : ''} ${isPopular ? 'popular' : ''}">
        ${isPopular ? '<div class="popular-badge">Most Popular</div>' : ''}
        ${isCurrentPlan ? '<div class="current-badge">Current Plan</div>' : ''}
        
        <div class="plan-header">
          <h3>${plan.name}</h3>
          <div class="plan-price">
            <span class="price-amount">$${plan.price}</span>
            <span class="price-period">${plan.price === 0 ? 'Free' : '/month'}</span>
          </div>
        </div>
        
        <div class="plan-features">
          <ul>
            ${plan.features.map(feature => `
              <li>
                <span class="feature-icon">✓</span>
                ${feature}
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div class="plan-action">
          ${isCurrentPlan ? (
            '<button class="btn secondary current-plan-btn">Current Plan</button>'
          ) : canUpgrade ? (
            `<button class="btn primary" onclick="PlansPage.handleUpgrade('${planKey}', ${plan.price})">
              ${plan.price === 0 ? 'Downgrade to Starter' : 'Upgrade to ' + plan.name}
            </button>`
          ) : (
            '<button class="btn outline" onclick="PlansPage.showLoginRequired()">Sign up to Choose Plan</button>'
          )}
        </div>
      </div>
    `;
  },

  // Render comparison table
  renderComparisonTable: (plans) => {
    const features = [
      { key: 'products', label: 'Products/Links' },
      { key: 'customDomain', label: 'Custom Domain' },
      { key: 'removeBranding', label: 'Remove CreateHub Branding' },
      { key: 'customThemes', label: 'Custom Themes' },
      { key: 'apiAccess', label: 'API Access' },
      { key: 'emailCapture', label: 'Email Capture Tools' },
      { key: 'marketingIntegrations', label: 'Marketing Integrations' },
      { key: 'prioritySupport', label: 'Priority Support' },
      { key: 'commission', label: 'Platform Commission' }
    ];

    return `
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Features</th>
              ${Object.entries(plans).map(([key, plan]) => `
                <th class="${key}">
                  ${plan.name}
                  ${plan.price > 0 ? `<br><small>$${plan.price}/mo</small>` : '<br><small>Free</small>'}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${features.map(feature => `
              <tr>
                <td class="feature-label">${feature.label}</td>
                ${Object.entries(plans).map(([key, plan]) => `
                  <td class="${key}">
                    ${PlansPage.renderFeatureValue(plan.limits[feature.key], feature.key, plan.commission)}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // Render feature value in comparison table
  renderFeatureValue: (value, featureKey, commission) => {
    if (featureKey === 'commission') {
      return commission === 0 ? '✅ 0%' : `${(commission * 100)}%`;
    }
    
    if (value === true) return '✅ Yes';
    if (value === false) return '❌ No';
    if (value === -1) return '✅ Unlimited';
    if (typeof value === 'number') return value;
    return '❌ No';
  },

  // Render FAQ section
  renderFAQ: () => {
    const faqs = [
      {
        q: 'Can I change plans anytime?',
        a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
      },
      {
        q: 'What happens if I downgrade?',
        a: 'If you downgrade to a plan with fewer features, you\'ll need to remove any excess products or disable features that exceed the new plan limits.'
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer a 30-day money-back guarantee for paid plans. Contact support if you\'re not satisfied.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards through Stripe. Payment processing is secure and encrypted.'
      },
      {
        q: 'Is there a long-term contract?',
        a: 'No, all plans are month-to-month. You can cancel anytime without penalties.'
      }
    ];

    return `
      <div class="faq-list">
        ${faqs.map((faq, index) => `
          <div class="faq-item">
            <button class="faq-question" onclick="PlansPage.toggleFAQ(${index})">
              ${faq.q}
              <span class="faq-toggle">+</span>
            </button>
            <div class="faq-answer" id="faq-answer-${index}">
              <p>${faq.a}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // Handle plan upgrade
  handleUpgrade: async (plan, price) => {
    if (!S.user || S.user.role !== 'creator') {
      showToast('Please sign in as a creator to upgrade', 'error');
      return;
    }

    if (price > 0) {
      // Show confirmation modal for paid plans
      const confirmed = confirm(`Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan for $${price}/month?`);
      if (!confirmed) return;
    }

    try {
      showToast('Processing upgrade...', 'info');
      
      await API.subscriptions.upgrade({ plan });
      
      showToast('Plan upgraded successfully!', 'success');
      
      // Reload the page to show updated status
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      console.error('Upgrade error:', err);
      showToast('Failed to upgrade plan: ' + err.message, 'error');
    }
  },

  // Handle plan cancellation
  handleCancelPlan: async () => {
    const confirmed = confirm('Are you sure you want to cancel your subscription? You\'ll keep access until the end of your billing period.');
    if (!confirmed) return;

    try {
      showToast('Cancelling subscription...', 'info');
      
      await API.subscriptions.cancelPlan();
      
      showToast('Subscription cancelled successfully', 'success');
      
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      console.error('Cancel error:', err);
      showToast('Failed to cancel subscription: ' + err.message, 'error');
    }
  },

  // Show login required message
  showLoginRequired: () => {
    showToast('Please sign in to choose a plan', 'info');
    // Redirect to login page
    setTimeout(() => S.route = 'auth', 1000);
  },

  // Toggle FAQ item
  toggleFAQ: (index) => {
    const answer = document.getElementById(`faq-answer-${index}`);
    const toggle = answer.previousElementSibling.querySelector('.faq-toggle');
    
    if (answer.style.display === 'block') {
      answer.style.display = 'none';
      toggle.textContent = '+';
    } else {
      answer.style.display = 'block';
      toggle.textContent = '-';
    }
  }
};
