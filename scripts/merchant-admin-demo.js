
import crypto from 'node:crypto';

// DEMO-ONLY credentials. Never reuse real merchant credentials.
const username = process.env.DEMO_ADMIN_USER || '';
const password = process.env.DEMO_ADMIN_PASSWORD || '';

// All records below are fictional and read-only.
const demoTransactions = [
  { id: 'DEMO-TXN-1001', date: '2026-10-18', time: '09:15', customer: 'Demo Customer A', amount: 100, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1002', date: '2026-10-18', time: '11:20', customer: 'Demo Customer B', amount: 500, status: 'FAILED' },
  { id: 'DEMO-TXN-1003', date: '2026-10-19', time: '10:30', customer: 'Demo Customer C', amount: 1000, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1004', date: '2026-10-19', time: '14:05', customer: 'Demo Customer D', amount: 2500, status: 'CANCELLED' },
  { id: 'DEMO-TXN-1005', date: '2026-10-20', time: '09:40', customer: 'Demo Customer E', amount: 500, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1006', date: '2026-10-20', time: '16:10', customer: 'Demo Customer F', amount: 100, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1007', date: '2026-10-21', time: '11:02', customer: 'Demo Customer G', amount: 1000, status: 'PENDING' },
  { id: 'DEMO-TXN-1008', date: '2026-10-21', time: '13:20', customer: 'Demo Customer H', amount: 500, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1009', date: '2026-10-22', time: '10:10', customer: 'Demo Customer I', amount: 750, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1010', date: '2026-10-22', time: '12:25', customer: 'Demo Customer J', amount: 1200, status: 'FAILED' },
  { id: 'DEMO-TXN-1011', date: '2026-10-23', time: '15:35', customer: 'Demo Customer K', amount: 250, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1012', date: '2026-10-23', time: '17:15', customer: 'Demo Customer L', amount: 2000, status: 'PENDING' },
  { id: 'DEMO-TXN-1013', date: '2026-10-24', time: '08:20', customer: 'Demo Customer M', amount: 300, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1014', date: '2026-10-24', time: '09:05', customer: 'Demo Customer N', amount: 1500, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1015', date: '2026-10-24', time: '10:45', customer: 'Demo Customer O', amount: 800, status: 'CANCELLED' }
];

function constantTimeEqual(a, b) {
  const first = crypto.createHash('sha256').update(a).digest();
  const second = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(first, second);
}

function authorized(req) {
  if (!username || !password) return false;

  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;

  try {
    const encoded = header.slice(6).trim();
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return false;

    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator < 0) return false;

    return (
      constantTimeEqual(decoded.slice(0, separator), username) &&
      constantTimeEqual(decoded.slice(separator + 1), password)
    );
  } catch {
    return false;
  }
}

function send(res, status, body, head = false, extra = {}) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, private',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    ...extra
  });
  res.end(head ? undefined : body);
}

function renderDashboard() {
  // The dataset is hardcoded, not user-supplied.
  // Escaping "<" prevents accidental script-tag termination
  // when embedding JSON in the HTML script.
  const dataJSON = JSON.stringify(demoTransactions).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>YouPI PG | Merchant Admin Analytics Demo</title>
<style>
:root {
  --navy:#0f172a;
  --blue:#2563eb;
  --bg:#f1f5f9;
  --text:#1e293b;
  --muted:#64748b;
  --border:#e2e8f0;
}
* { box-sizing:border-box; }
body {
  margin:0;
  background:var(--bg);
  color:var(--text);
  font-family:Arial,Helvetica,sans-serif;
}
header {
  background:var(--navy);
  color:white;
  padding:20px 5%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
  flex-wrap:wrap;
}
.brand { font-size:21px; font-weight:800; }
header a {
  color:white;
  text-decoration:none;
  background:#334155;
  padding:10px 15px;
  border-radius:9px;
}
main {
  max-width:1320px;
  margin:30px auto;
  padding:0 18px;
}
.notice {
  padding:16px 18px;
  background:#fff7df;
  border:1px solid #f5d48c;
  color:#805600;
  border-radius:12px;
  margin-bottom:24px;
  line-height:1.6;
}
h1 { font-size:27px; margin:0 0 8px; }
h2 { font-size:19px; margin:0 0 18px; }
.subtitle { color:var(--muted); margin-bottom:25px; }
.cards {
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:16px;
}
.card,.panel {
  background:white;
  border:1px solid var(--border);
  border-radius:15px;
  box-shadow:0 5px 22px #0f172a09;
}
.card { padding:22px; }
.card-label {
  color:var(--muted);
  font-size:13px;
  font-weight:700;
}
.card-value {
  font-size:29px;
  font-weight:800;
  margin-top:12px;
  overflow-wrap:anywhere;
}
.panel {
  margin-top:22px;
  padding:24px;
}
.filters {
  display:grid;
  grid-template-columns:2fr 1fr 1fr 1fr auto;
  gap:12px;
  align-items:end;
}
.field label {
  display:block;
  font-size:12px;
  font-weight:700;
  color:var(--muted);
  margin-bottom:7px;
}
input,select {
  width:100%;
  min-height:42px;
  padding:10px;
  border:1px solid #cbd5e1;
  border-radius:8px;
  background:white;
  color:var(--text);
  font:inherit;
}
button {
  min-height:42px;
  padding:10px 15px;
  border:0;
  border-radius:8px;
  cursor:pointer;
  font-weight:700;
  background:var(--blue);
  color:white;
}
button.secondary { background:#e2e8f0; color:var(--text); }
button:hover { filter:brightness(.95); }
.actions {
  display:flex;
  align-items:center;
  justify-content:space-between;
  flex-wrap:wrap;
  gap:12px;
  margin-bottom:15px;
}
.actions p { color:var(--muted); margin:0; }
.charts {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:22px;
}
.chart-row {
  display:grid;
  grid-template-columns:95px 1fr 55px;
  align-items:center;
  gap:10px;
  margin:15px 0;
  font-size:13px;
}
.track {
  background:#e2e8f0;
  height:17px;
  border-radius:5px;
  overflow:hidden;
}
.bar {
  height:100%;
  width:0;
  background:#2563eb;
  border-radius:5px;
}
.bar.success { background:#16a34a; }
.bar.failed { background:#dc2626; }
.bar.pending { background:#f59e0b; }
.bar.cancelled { background:#64748b; }
.chart-empty { color:var(--muted); font-size:13px; }
.table-wrap { overflow-x:auto; }
table {
  width:100%;
  min-width:720px;
  border-collapse:collapse;
}
th,td {
  text-align:left;
  padding:14px 12px;
  border-bottom:1px solid var(--border);
}
th {
  background:#f8fafc;
  color:var(--muted);
  font-size:12px;
  text-transform:uppercase;
}
td { font-size:14px; }
.status {
  display:inline-block;
  border-radius:6px;
  padding:6px 9px;
  font-size:11px;
  font-weight:800;
}
.status.success { background:#dcfce7; color:#166534; }
.status.failed { background:#fee2e2; color:#991b1b; }
.status.pending { background:#fef3c7; color:#92400e; }
.status.cancelled { background:#e2e8f0; color:#475569; }
.empty {
  padding:30px;
  text-align:center;
  color:var(--muted);
}
footer {
  text-align:center;
  color:var(--muted);
  padding:30px;
  font-size:13px;
}
@media(max-width:1000px) {
  .filters { grid-template-columns:repeat(2,1fr); }
  .cards { grid-template-columns:repeat(2,1fr); }
}
@media(max-width:700px) {
  .charts { grid-template-columns:1fr; }
}
@media(max-width:480px) {
  .cards,.filters { grid-template-columns:1fr; }
  .panel { padding:17px; }
}
</style>
</head>
<body>

<header>
  <div class="brand">⚡ YouPI PG · Merchant Admin Demo</div>
  <a href="/">← Back to Store</a>
</header>

<main>
  <div class="notice">
    <strong>SIMULATION ONLY — FICTIONAL TRANSACTIONS</strong>
    <div>
      All displayed records, amounts and statuses are fabricated.
      This dashboard has no access to real merchants, UPI transactions,
      bank balances, refunds or settlement systems.
    </div>
  </div>

  <h1>Merchant Analytics Overview</h1>
  <p class="subtitle">
    Interactive dashboard · Fictional sample data · Read-only
  </p>

  <section class="cards" aria-label="Filtered analytics">
    <div class="card">
      <div class="card-label">Total Demo Transactions</div>
      <div class="card-value" id="totalCount">0</div>
    </div>
    <div class="card">
      <div class="card-label">Simulated Successful Volume</div>
      <div class="card-value" id="totalVolume">₹0</div>
    </div>
    <div class="card">
      <div class="card-label">Demo Success Rate</div>
      <div class="card-value" id="successRate">0%</div>
    </div>
    <div class="card">
      <div class="card-label">Pending Demo Transactions</div>
      <div class="card-value" id="pendingCount">0</div>
    </div>
  </section>

  <section class="panel">
    <h2>Search and Filter Transactions</h2>

    <div class="filters">
      <div class="field">
        <label for="searchInput">Transaction ID / Customer</label>
        <input id="searchInput" type="search"
               placeholder="Search demo transactions...">
      </div>

      <div class="field">
        <label for="statusFilter">Payment Status</label>
        <select id="statusFilter">
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div class="field">
        <label for="startDate">Start Date</label>
        <input id="startDate" type="date">
      </div>

      <div class="field">
        <label for="endDate">End Date</label>
        <input id="endDate" type="date">
      </div>

      <button class="secondary" id="resetButton">
        Reset Filters
      </button>
    </div>

    <p id="filterMessage" class="subtitle" role="status"
       aria-live="polite" style="margin:15px 0 0"></p>
  </section>

  <section class="charts">
    <div class="panel">
      <h2>Transaction Status Distribution</h2>
      <div id="statusChart"></div>
    </div>

    <div class="panel">
      <h2>Daily Simulated Successful Volume</h2>
      <div id="dailyChart"></div>
    </div>
  </section>

  <section class="panel">
    <div class="actions">
      <div>
        <h2 style="margin-bottom:6px">Transaction History</h2>
        <p id="recordCount">0 records</p>
      </div>
      <button id="exportButton">↓ Export Filtered CSV</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="transactionBody"></tbody>
      </table>
    </div>

    <div id="emptyMessage" class="empty" hidden>
      No fictional transactions match the selected filters.
    </div>
  </section>
</main>

<footer>
  YouPI PG · Protected Demo Dashboard · Not a Financial Record
</footer>

<script>
const transactions = ${dataJSON};
let filteredTransactions = [];

const byId = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('en-IN', {
  style:'currency',
  currency:'INR',
  maximumFractionDigits:2
}).format(value);

const statuses = ['SUCCESS','FAILED','PENDING','CANCELLED'];

function getFilteredTransactions() {
  const query = byId('searchInput').value.trim().toLowerCase();
  const status = byId('statusFilter').value;
  const start = byId('startDate').value;
  const end = byId('endDate').value;

  return transactions.filter(t => {
    const matchesQuery =
      t.id.toLowerCase().includes(query) ||
      t.customer.toLowerCase().includes(query);

    return matchesQuery &&
      (status === 'ALL' || t.status === status) &&
      (!start || t.date >= start) &&
      (!end || t.date <= end);
  });
}

function renderMetrics(data) {
  const successful = data.filter(t => t.status === 'SUCCESS');
  const volume = successful.reduce((sum,t) => sum + t.amount,0);
  const pending = data.filter(t => t.status === 'PENDING').length;

  byId('totalCount').textContent = data.length;
  byId('totalVolume').textContent = money(volume);
  byId('successRate').textContent = data.length
    ? (successful.length / data.length * 100).toFixed(1) + '%'
    : '0%';
  byId('pendingCount').textContent = pending;
}

function makeChartRow(label, value, max, className, suffix) {
  const row = document.createElement('div');
  row.className = 'chart-row';

  const name = document.createElement('span');
  name.textContent = label;

  const track = document.createElement('div');
  track.className = 'track';

  const bar = document.createElement('div');
  bar.className = 'bar ' + className;
  bar.style.width = (max ? value / max * 100 : 0) + '%';

  const count = document.createElement('strong');
  count.textContent = suffix || String(value);
  count.title = suffix || String(value);

  track.appendChild(bar);
  row.append(name,track,count);
  return row;
}

function renderCharts(data) {
  const statusChart = byId('statusChart');
  const dailyChart = byId('dailyChart');

  statusChart.replaceChildren();
  dailyChart.replaceChildren();

  const counts = Object.fromEntries(
    statuses.map(status => [
      status,
      data.filter(t => t.status === status).length
    ])
  );

  const maxCount = Math.max(1,...Object.values(counts));

  for (const status of statuses) {
    statusChart.appendChild(makeChartRow(
      status,counts[status],maxCount,status.toLowerCase()
    ));
  }

  const daily = {};

  for (const t of data) {
    if (t.status === 'SUCCESS') {
      daily[t.date] = (daily[t.date] || 0) + t.amount;
    }
  }

  const dates = Object.keys(daily).sort();
  const maxVolume = Math.max(1,...Object.values(daily));

  if (!dates.length) {
    const empty = document.createElement('p');
    empty.className = 'chart-empty';
    empty.textContent = 'No successful demo transactions in this selection.';
    dailyChart.appendChild(empty);
    return;
  }

  for (const date of dates) {
    dailyChart.appendChild(makeChartRow(
      date,daily[date],maxVolume,'',money(daily[date])
    ));
  }
}

function renderTable(data) {
  const body = byId('transactionBody');
  body.replaceChildren();

  for (const t of data) {
    const tr = document.createElement('tr');

    const values = [
      t.id,
      t.date + ' ' + t.time,
      t.customer,
      money(t.amount)
    ];

    for (const value of values) {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    }

    const statusCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'status ' + t.status.toLowerCase();
    badge.textContent = t.status;
    statusCell.appendChild(badge);
    tr.appendChild(statusCell);

    body.appendChild(tr);
  }

  byId('recordCount').textContent =
    data.length + ' of ' + transactions.length + ' fictional records';

  byId('emptyMessage').hidden = data.length !== 0;
  byId('exportButton').disabled = data.length === 0;
}

function updateDashboard() {
  const start = byId('startDate').value;
  const end = byId('endDate').value;

  if (start && end && start > end) {
    byId('filterMessage').textContent =
      'Start date must be earlier than or equal to end date.';
    filteredTransactions = [];
  } else {
    byId('filterMessage').textContent =
      'Showing fictional records only. All filters update instantly.';
    filteredTransactions = getFilteredTransactions();
  }

  renderMetrics(filteredTransactions);
  renderCharts(filteredTransactions);
  renderTable(filteredTransactions);
}

function resetFilters() {
  byId('searchInput').value = '';
  byId('statusFilter').value = 'ALL';
  byId('startDate').value = '';
  byId('endDate').value = '';
  updateDashboard();
}

// CSV escaping, including protection against spreadsheet formula injection.
function csvCell(value) {
  let text = String(value);

  if (/^[\s\x00-\x1f]*[=+@-]/.test(text)) {
  text = "'" + text;
  }

  return '"' + text.replace(/"/g,'""') + '"';
}

function exportCSV() {
  if (!filteredTransactions.length) return;

  const rows = [
    ['Transaction ID','Date','Time','Customer','Amount INR','Status'],
    ...filteredTransactions.map(t => [
      t.id,t.date,t.time,t.customer,t.amount,t.status
    ])
  ];

  const csv = '\uFEFF' + rows.map(row =>
  row.map(csvCell).join(',')
).join('\r\n');.join('\\r\\n');

  const blob = new Blob([csv], {
    type:'text/csv;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'youpi-demo-transactions.csv';

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url),1000);
}

for (const id of ['searchInput','statusFilter','startDate','endDate']) {
  byId(id).addEventListener('input',updateDashboard);
  byId(id).addEventListener('change',updateDashboard);
}

byId('resetButton').addEventListener('click',resetFilters);
byId('exportButton').addEventListener('click',exportCSV);

updateDashboard();
</script>
</body>
</html>`;
}

export function handleMerchantAdminDemo(req,res,pathname) {
  if (pathname !== '/admin/demo' && pathname !== '/admin/demo/') {
    return false;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res,405,'Method not allowed',false,{
      'Allow':'GET, HEAD'
    });
    return true;
  }

  if (!username || !password) {
    send(res,503,'Demo admin credentials are not configured.');
    return true;
  }

  if (!authorized(req)) {
    send(res,401,'Authentication required.',false,{
      'WWW-Authenticate':
        'Basic realm="YouPI Merchant Demo", charset="UTF-8"'
    });
    return true;
  }

  send(res,200,renderDashboard(),req.method === 'HEAD',{
    'Content-Security-Policy':
      "default-src 'none'; " +
      "style-src 'unsafe-inline'; " +
      "script-src 'unsafe-inline'; " +
      "connect-src 'none'; " +
      "img-src 'none'; " +
      "object-src 'none'; " +
      "base-uri 'none'; " +
      "form-action 'none'; " +
      "frame-ancestors 'none'"
  });

  return true;
}
