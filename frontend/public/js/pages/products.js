/* ═══════════════════════════════════════════════
   CreateHub — Products Page
   ═══════════════════════════════════════════════ */

const ProductsPage = {
  _products: [],

  async render() {
    Dashboard.setContent(H.loading());
    try {
      const res = await API.products.list();
      this._products = res.products || [];
      this.renderList();
    } catch (err) {
      Dashboard.setContent(H.empty('📦', 'Could not load products', err.message,
        `<button class="btn btn-outline mt-2" onclick="ProductsPage.render()">Retry</button>`));
    }
  },

  renderList() {
    const products = this._products;
    Dashboard.setContent(`
      <div class="page-header">
        <div>
          <div class="page-title">My Products</div>
          <div class="page-subtitle">Create and manage your digital products.</div>
        </div>
        <button class="btn btn-primary" onclick="ProductsPage.openCreateModal()">+ New product</button>
      </div>

      ${products.length === 0
        ? H.empty('📦', 'No products yet', 'Create your first digital product to start earning.',
            `<button class="btn btn-primary mt-2" onclick="ProductsPage.openCreateModal()">+ Create product</button>`)
        : `<div class="product-grid" id="product-grid">
            ${products.map(p => this.productCard(p)).join('')}
            <div class="product-card product-add-card" onclick="ProductsPage.openCreateModal()">
              <div class="product-add-inner">
                <div class="product-add-icon">+</div>
                <div style="font-size:14px;font-weight:500">Add new product</div>
              </div>
            </div>
          </div>`
      }
    `);
    this.bindEvents();
  },

  productCard(p) {
    const typeIcons = { course:'🎨', template:'📋', ebook:'📖', file_bundle:'📦', coaching:'🎯', subscription:'♻️' };
    return `
    <div class="product-card" data-id="${p._id}">
      <div class="product-thumb">${typeIcons[p.type] || '📦'}</div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-meta">
          <span>${p.type.replace('_', ' ')}</span>
          ${H.badge(p.status)}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.75rem">
          <div class="product-price">${Fmt.currency(p.pricing.amount)}</div>
          <div style="font-size:12.5px;color:var(--text2)">${Fmt.number(p.stats.sales)} sales</div>
        </div>
        <div class="product-actions">
          <button class="btn btn-outline btn-sm" data-action="edit" data-id="${p._id}">Edit</button>
          <button class="btn btn-outline btn-sm" data-action="analytics" data-id="${p._id}">Analytics</button>
          ${p.status === 'draft'
            ? `<button class="btn btn-success btn-sm" data-action="publish" data-id="${p._id}">Publish</button>`
            : `<button class="btn btn-outline btn-sm" data-action="archive" data-id="${p._id}">Archive</button>`}
        </div>
      </div>
    </div>`;
  },

  bindEvents() {
    delegate('#page-area', '[data-action]', 'click', (e, el) => {
      const { action, id } = el.dataset;
      if (action === 'edit')      this.openEditModal(id);
      if (action === 'analytics') this.showAnalytics(id);
      if (action === 'publish')   this.updateStatus(id, 'active');
      if (action === 'archive')   this.updateStatus(id, 'archived');
    });
  },

  openCreateModal() {
    Modal.open(`
      <div class="modal-title">Create New Product</div>
      <div class="form-group">
        <label>Product name</label>
        <input id="p-name" placeholder="e.g. UI Design Masterclass"/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Type</label>
          <select id="p-type">
            <option value="course">Course</option>
            <option value="template">Template</option>
            <option value="ebook">eBook</option>
            <option value="file_bundle">File Bundle</option>
            <option value="coaching">Coaching</option>
            <option value="subscription">Subscription</option>
          </select>
        </div>
        <div class="form-group">
          <label>Price (USD)</label>
          <input id="p-price" type="number" placeholder="29.00" min="0" step="0.01"/>
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="p-desc" rows="3" placeholder="Describe your product in a few sentences…"></textarea>
      </div>
      <div class="form-group">
        <label>Tags (comma-separated)</label>
        <input id="p-tags" placeholder="design, figma, ui"/>
      </div>
      <div id="create-err" style="display:none;color:var(--red);font-size:13px;margin-top:0.5rem"></div>
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="create-submit">Create product</button>
      </div>
    `);
    on('#create-submit', 'click', () => this.submitCreate());
  },

  async submitCreate() {
    const name  = $('#p-name')?.value.trim();
    const type  = $('#p-type')?.value;
    const amount= parseFloat($('#p-price')?.value) || 0;
    const desc  = $('#p-desc')?.value.trim();
    const tags  = $('#p-tags')?.value.trim();
    const errEl = $('#create-err');

    if (!name || !desc) {
      errEl.textContent = 'Name and description are required.';
      errEl.style.display = 'block';
      return;
    }

    const btn = $('#create-submit');
    btn.disabled = true; btn.textContent = 'Creating…';

    try {
      await API.products.create({ name, type, amount, description: desc, tags });
      Modal.close();
      Toast.success('Product created! 🎉');
      await this.render();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
      btn.disabled = false; btn.textContent = 'Create product';
    }
  },

  openEditModal(id) {
    const p = this._products.find(x => x._id === id);
    if (!p) return;
    Modal.open(`
      <div class="modal-title">Edit Product</div>
      <div class="form-group">
        <label>Product name</label>
        <input id="ep-name" value="${p.name}"/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Price (USD)</label>
          <input id="ep-price" type="number" value="${p.pricing.amount}" min="0" step="0.01"/>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="ep-status">
            <option value="draft"    ${p.status==='draft'   ?'selected':''}>Draft</option>
            <option value="active"   ${p.status==='active'  ?'selected':''}>Active</option>
            <option value="archived" ${p.status==='archived'?'selected':''}>Archived</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="ep-desc" rows="3">${p.description}</textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-danger" onclick="ProductsPage.confirmDelete('${id}')">Delete</button>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-outline" onclick="Modal.close()">Cancel</button>
          <button class="btn btn-primary" id="ep-save">Save changes</button>
        </div>
      </div>
    `);
    on('#ep-save', 'click', async () => {
      try {
        await API.products.update(id, {
          name: $('#ep-name').value,
          amount: parseFloat($('#ep-price').value),
          status: $('#ep-status').value,
          description: $('#ep-desc').value,
        });
        Modal.close();
        Toast.success('Product updated ✓');
        await this.render();
      } catch (err) { Toast.error(err.message); }
    });
  },

  async updateStatus(id, status) {
    try {
      await API.products.update(id, { status });
      Toast.success(`Product ${status === 'active' ? 'published' : 'archived'} ✓`);
      await this.render();
    } catch (err) { Toast.error(err.message); }
  },

  confirmDelete(id) {
    Modal.confirm('This will permanently delete the product and cannot be undone.', async () => {
      try {
        await API.products.remove(id);
        Toast.success('Product deleted');
        await this.render();
      } catch (err) { Toast.error(err.message); }
    }, { title: 'Delete Product', label: 'Delete', danger: true });
  },

  async showAnalytics(id) {
    try {
      const res = await API.products.analytics(id);
      const { stats } = res;
      Modal.open(`
        <div class="modal-title">Product Analytics</div>
        <div class="grid-2" style="margin-bottom:1rem">
          ${H.statCard('Sales',   stats.sales,              '', 'neu')}
          ${H.statCard('Revenue', Fmt.currency(stats.revenue), '', 'up')}
          ${H.statCard('Views',   stats.views,              '', 'neu')}
          ${H.statCard('Rating',  stats.rating || 'N/A',    '', 'neu')}
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="Modal.close()">Close</button>
        </div>
      `);
    } catch (err) { Toast.error(err.message); }
  },
};
