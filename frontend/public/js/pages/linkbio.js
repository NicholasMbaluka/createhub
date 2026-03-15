/* ═══════════════════════════════════════════════
   CreateHub — Link in Bio Page
   ═══════════════════════════════════════════════ */

const LinkBioPage = {
  async render() {
    Dashboard.setContent(H.loading());
    try {
      const [profileRes, productsRes] = await Promise.all([
        API.users.getProfile(),
        API.products.list({ status: 'active' }),
      ]);
      const user = profileRes.user;
      const products = productsRes.products || [];
      this.renderEditor(user, products);
    } catch (err) {
      Dashboard.setContent(H.empty('🔗', 'Could not load Link in Bio', err.message,
        `<button class="btn btn-outline mt-2" onclick="LinkBioPage.render()">Retry</button>`));
    }
  },

  renderEditor(user, products) {
    const slug = user.slug || (user.firstName + user.lastName).toLowerCase();
    const social = user.socialLinks || {};

    Dashboard.setContent(`
      <div class="page-header">
        <div>
          <div class="page-title">Link in Bio</div>
          <div class="page-subtitle">Customize your public creator profile page.</div>
        </div>
        <button class="btn btn-primary" id="bio-save">Save changes</button>
      </div>

      <div class="grid-2">
        <!-- Editor -->
        <div>
          <div class="card mb-2">
            <div class="card-title">Profile</div>
            <div class="form-group">
              <label>Display name</label>
              <input id="bio-name" value="${user.firstName} ${user.lastName}"/>
            </div>
            <div class="form-group">
              <label>Bio</label>
              <textarea id="bio-bio" rows="3">${user.bio || ''}</textarea>
            </div>
            <div class="form-group">
              <label>Page URL</label>
              <div class="input-group">
                <span class="input-prefix">createhub.io/</span>
                <input id="bio-slug" value="${slug}" placeholder="your-username"/>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-title" style="margin-bottom:0.75rem">Social Links</div>
            ${[
              { id: 'twitter',   icon: '🐦', label: 'Twitter / X',    val: social.twitter   || '' },
              { id: 'instagram', icon: '📸', label: 'Instagram',       val: social.instagram || '' },
              { id: 'youtube',   icon: '▶️', label: 'YouTube',         val: social.youtube   || '' },
              { id: 'website',   icon: '🌐', label: 'Website',         val: social.website   || '' },
            ].map(l => `
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:0.75rem">
                <span style="font-size:18px;flex-shrink:0">${l.icon}</span>
                <div style="flex:1">
                  <input id="social-${l.id}" placeholder="${l.label} URL" value="${l.val}"/>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Preview -->
        <div>
          <div style="font-size:10.5px;font-weight:700;color:var(--text3);letter-spacing:0.8px;text-transform:uppercase;margin-bottom:0.75rem">Live Preview</div>
          <div class="bio-preview">
            <div class="bio-ring"><div class="bio-inner">✨</div></div>
            <div style="font-family:var(--syne);font-size:19px;font-weight:800;margin-bottom:4px">${user.firstName} ${user.lastName}</div>
            <div style="font-size:13px;color:var(--text2);margin-bottom:1.5rem">${user.bio || 'Digital creator'}</div>

            ${products.slice(0, 4).map(p => `
              <div class="bio-link-item">
                <span>${this.typeIcon(p.type)}</span>
                <span>${p.name}</span>
                <span class="bio-link-price">${Fmt.currency(p.pricing.amount)}</span>
              </div>
            `).join('')}

            ${social.twitter   ? `<div class="bio-link-item">🐦 <span>${social.twitter}</span></div>`   : ''}
            ${social.instagram ? `<div class="bio-link-item">📸 <span>${social.instagram}</span></div>` : ''}
            ${social.youtube   ? `<div class="bio-link-item">▶️ <span>${social.youtube}</span></div>`   : ''}

            <div style="font-size:11px;color:var(--text3);margin-top:1.25rem">createhub.io/${slug}</div>
          </div>
          <div class="mt-2" style="display:flex;gap:8px">
            <button class="btn btn-outline btn-sm" onclick="Toast.info('Link copied to clipboard!')">📋 Copy link</button>
            <button class="btn btn-outline btn-sm" onclick="window.open('/u/${slug}','_blank')">🔗 Open page</button>
          </div>
        </div>
      </div>
    `);

    on('#bio-save', 'click', () => this.save());
  },

  typeIcon(type) {
    const icons = { course:'🎨', template:'📋', ebook:'📖', file_bundle:'📦', coaching:'🎯', subscription:'♻️' };
    return icons[type] || '📦';
  },

  async save() {
    const btn = $('#bio-save');
    btn.disabled = true; btn.textContent = 'Saving…';
    try {
      const nameParts = ($('#bio-name')?.value || '').trim().split(' ');
      await API.users.updateProfile({
        firstName: nameParts[0] || '',
        lastName:  nameParts.slice(1).join(' ') || '',
        bio:       $('#bio-bio')?.value.trim(),
        slug:      $('#bio-slug')?.value.trim().toLowerCase().replace(/\s+/g, '-'),
        socialLinks: {
          twitter:   $('#social-twitter')?.value.trim(),
          instagram: $('#social-instagram')?.value.trim(),
          youtube:   $('#social-youtube')?.value.trim(),
          website:   $('#social-website')?.value.trim(),
        },
      });
      await Auth.refreshUser();
      Toast.success('Profile saved! ✓');
    } catch (err) {
      Toast.error(err.message);
    } finally {
      btn.disabled = false; btn.textContent = 'Save changes';
    }
  },
};
