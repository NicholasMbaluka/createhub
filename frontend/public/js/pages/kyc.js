/* ═══════════════════════════════════════════════
   CreateHub — KYC Verification Page
   ═══════════════════════════════════════════════ */

const KYCPage = {
  async render() {
    Dashboard.setContent(H.loading());
    try {
      const res = await API.kyc.status();
      const { kyc } = res;
      this.renderStatus(kyc);
    } catch (err) {
      Dashboard.setContent(H.empty('🔐', 'Could not load KYC status', err.message,
        `<button class="btn btn-outline mt-2" onclick="KYCPage.render()">Retry</button>`));
    }
  },

  renderStatus(kyc) {
    const statusMap = {
      verified: { color: 'success', icon: '✅', title: 'Identity Verified', body: 'Your KYC is approved. All monetization features are fully unlocked.' },
      pending:  { color: 'warning', icon: '⏳', title: 'Verification In Progress', body: 'Your submission is under review. We'll notify you within 24–48 hours.' },
      rejected: { color: 'danger',  icon: '❌', title: 'Verification Unsuccessful', body: `Reason: ${kyc.rejectionReason || 'Documents could not be verified'}. Please resubmit.` },
      none:     { color: 'info',    icon: 'ℹ️', title: 'Verification Required', body: 'Complete identity verification to unlock monetization, payments, and higher payout limits.' },
    };
    const s = statusMap[kyc.status] || statusMap.none;

    const steps = [
      { label: 'Email Verification',   desc: 'Confirm your email address',                   done: true },
      { label: 'Personal Information', desc: 'Full name, date of birth, address',             done: kyc.status !== 'none' },
      { label: 'Identity Document',    desc: 'Government-issued ID or passport',              done: kyc.status !== 'none' },
      { label: 'Selfie Verification',  desc: 'Photo match with your identity document',       done: kyc.status === 'verified' },
      { label: 'Bank Account',         desc: 'Verify your payout method',                     done: kyc.status === 'verified' },
    ];

    const limits = kyc.status === 'verified'
      ? [['Monthly payout','Unlimited'],['Per transaction','$10,000'],['Products','Unlimited'],['Payout schedule','Weekly']]
      : [['Monthly payout','$500'],['Per transaction','$100'],['Products','3'],['Payout schedule','Locked']];

    Dashboard.setContent(`
      <div class="page-header">
        <div>
          <div class="page-title">KYC Verification</div>
          <div class="page-subtitle">Verify your identity to unlock full monetization.</div>
        </div>
      </div>
      <div style="max-width:580px">
        ${H.alert(s.color, s.icon, s.title, s.body)}

        <div class="card mb-2">
          <div class="card-title">Verification Steps</div>
          ${steps.map((step, i) => `
            <div class="kyc-step">
              <div class="kyc-num ${step.done ? 'done' : kyc.status === 'pending' && i <= 2 ? 'pending' : 'lock'}">
                ${step.done ? '✓' : kyc.status === 'pending' && i <= 2 ? '…' : i + 1}
              </div>
              <div style="flex:1">
                <div class="kyc-step-title">${step.label}</div>
                <div class="kyc-step-desc">${step.desc}</div>
              </div>
              ${step.done ? H.badge('complete', 'green') : kyc.status === 'pending' && i <= 2 ? H.badge('in review', 'amber') : ''}
            </div>
          `).join('')}
        </div>

        <div class="card mb-2">
          <div class="card-title">Your Limits</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
            ${limits.map(([l, v]) => `
              <div style="background:var(--bg3s);border-radius:8px;padding:0.85rem">
                <div style="font-size:11px;color:var(--text3);margin-bottom:4px">${l}</div>
                <div style="font-size:14px;font-weight:600;color:${kyc.status === 'verified' ? 'var(--green)' : 'var(--amber)'}">${v}</div>
              </div>
            `).join('')}
          </div>
        </div>

        ${kyc.status === 'none' || kyc.status === 'rejected' ? `
          <div class="card">
            <div class="card-title">Submit Verification</div>
            <div class="form-group">
              <label>Document type</label>
              <select id="doc-type">
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="drivers_license">Driver's License</option>
              </select>
            </div>
            <div class="form-group">
              <label>Full legal name</label>
              <input id="kyc-name" placeholder="As shown on your document" value="${Auth.getUser().firstName} ${Auth.getUser().lastName}"/>
            </div>
            <div class="form-group">
              <label>Date of birth</label>
              <input id="kyc-dob" type="date"/>
            </div>
            <div class="form-group">
              <label>Document upload (simulated)</label>
              <div style="border:1px dashed var(--border2);border-radius:8px;padding:1.5rem;text-align:center;color:var(--text3);font-size:13px;cursor:pointer">
                📎 Click to upload document (PNG, JPG, PDF — max 10MB)
              </div>
            </div>
            <button class="btn btn-primary" id="kyc-submit">Submit for verification</button>
          </div>
        ` : ''}
      </div>
    `);

    on('#kyc-submit', 'click', () => this.submit());
  },

  async submit() {
    const docType = $('#doc-type')?.value;
    const btn = $('#kyc-submit');
    btn.disabled = true; btn.textContent = 'Submitting…';
    try {
      await API.kyc.submit({ documentType: docType });
      await Auth.refreshUser();
      Toast.success('KYC submitted! We'll review within 24–48 hours.');
      await this.render();
    } catch (err) {
      Toast.error(err.message);
      btn.disabled = false; btn.textContent = 'Submit for verification';
    }
  },
};
