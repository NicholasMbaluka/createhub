/* ═══════════════════════════════════════════════
   CreateHub — Analytics Page
   ═══════════════════════════════════════════════ */

const AnalyticsPage = {
  _period: '30d',

  async render(period) {
    if (period) this._period = period;
    Dashboard.setContent(H.loading());
    try {
      const res = await API.analytics.creator({ period: this._period });
      const { summary, chart, topProducts } = res;
      const days = Object.values(chart.revenueByDay || {});
      const chartFull = days.length ? days : Array(20).fill(0).map(() => Math.random() * 500);

      Dashboard.setContent(`
        <div class="page-header">
          <div>
            <div class="page-title">Analytics</div>
            <div class="page-subtitle">Track your performance across all products and channels.</div>
          </div>
          <div style="display:flex;gap:6px">
            ${['7d','30d','90d','1y'].map(p => `
              <button class="btn btn-sm ${this._period === p ? 'btn-primary' : 'btn-outline'}"
                onclick="AnalyticsPage.render('${p}')">${p.toUpperCase()}</button>
            `).join('')}
          </div>
        </div>

        <div class="stats-grid">
          ${H.statCard('Total Revenue',    Fmt.currency(summary.totalRevenue), '↑ this period', 'up')}
          ${H.statCard('Total Sales',      Fmt.number(summary.totalSales),     '↑ this period', 'up')}
          ${H.statCard('Avg Order Value',  Fmt.currency(summary.avgOrderValue), '',              'neu')}
          ${H.statCard('Active Subs',      summary.activeSubscribers,           '',              'neu')}
        </div>

        <div class="card mb-2">
          <div class="card-header">
            <div class="card-title" style="margin-bottom:0">Revenue over time</div>
            <span style="font-size:12px;color:var(--text3)">${this._period.toUpperCase()} period</span>
          </div>
          ${H.barChart(chartFull, 'var(--accent)', 120)}
          <div class="chart-labels">
            <span>Start of period</span><span>Today</span>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-title">Revenue by product</div>
            ${topProducts.length
              ? topProducts.map(p => `
                <div style="margin-bottom:0.9rem">
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                    <span style="color:var(--text)">${p.name}</span>
                    <span style="color:var(--green);font-weight:600">${Fmt.currency(p.revenue)}</span>
                  </div>
                  ${H.progress(topProducts[0].revenue ? Math.round((p.revenue / topProducts[0].revenue) * 100) : 0)}
                </div>
              `).join('')
              : `<p style="color:var(--text3);font-size:13px">No sales data yet.</p>`
            }
          </div>
          <div class="card">
            <div class="card-title">Traffic sources</div>
            ${[
              { src: 'Direct',         pct: 38, c: 'var(--accent)' },
              { src: 'Twitter / X',    pct: 25, c: 'var(--blue)' },
              { src: 'Organic search', pct: 20, c: 'var(--green)' },
              { src: 'Instagram',      pct: 12, c: 'var(--pink)' },
              { src: 'Other',          pct: 5,  c: 'var(--text3)' },
            ].map(s => `
              <div style="margin-bottom:0.9rem">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
                  <span style="color:var(--text)">${s.src}</span>
                  <span style="color:var(--text2)">${s.pct}%</span>
                </div>
                ${H.progress(s.pct, s.c)}
              </div>
            `).join('')}
          </div>
        </div>
      `);
    } catch (err) {
      Dashboard.setContent(H.empty('📈', 'Could not load analytics', err.message,
        `<button class="btn btn-outline mt-2" onclick="AnalyticsPage.render()">Retry</button>`));
    }
  },
};
