
import crypto from 'node:crypto';

const username = process.env.DEMO_ADMIN_USER || '';
const password = process.env.DEMO_ADMIN_PASSWORD || '';

const demoTransactions = [
  { id: 'DEMO-TXN-1001', date: '2026-10-24 09:15', customer: 'Demo Customer A', amount: 100, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1002', date: '2026-10-24 09:22', customer: 'Demo Customer B', amount: 500, status: 'FAILED' },
  { id: 'DEMO-TXN-1003', date: '2026-10-24 09:38', customer: 'Demo Customer C', amount: 1000, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1004', date: '2026-10-24 10:05', customer: 'Demo Customer D', amount: 2500, status: 'CANCELLED' },
  { id: 'DEMO-TXN-1005', date: '2026-10-24 10:18', customer: 'Demo Customer E', amount: 500, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1006', date: '2026-10-24 10:42', customer: 'Demo Customer F', amount: 100, status: 'SUCCESS' },
  { id: 'DEMO-TXN-1007', date: '2026-10-24 11:02', customer: 'Demo Customer G', amount: 1000, status: 'PENDING' },
  { id: 'DEMO-TXN-1008', date: '2026-10-24 11:20', customer: 'Demo Customer H', amount: 500, status: 'SUCCESS' }
];

function constantTimeEqual(a, b) {
  const aHash = crypto.createHash('sha256').update(a).digest();
  const bHash = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(aHash, bHash);
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

    const suppliedUser = decoded.slice(0, separator);
    const suppliedPassword = decoded.slice(separator + 1);

    const userMatches = constantTimeEqual(suppliedUser, username);
    const passwordMatches = constantTimeEqual(suppliedPassword, password);

    return userMatches && passwordMatches;
  } catch {
    return false;
  }
}

function send(res, status, body, contentType = 'text/plain; charset=utf-8', head = false, extra = {}) {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store, private',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    ...extra
  });
  res.end(head ? undefined : body);
}

function renderDashboard() {
  const total = demoTransactions.length;
  const success = demoTransactions.filter(t => t.status === 'SUCCESS');
  const failed = demoTransactions.filter(t => t.status === 'FAILED').length;
  const pending = demoTransactions.filter(t => t.status === 'PENDING').length;
  const cancelled = demoTransactions.filter(t => t.status === 'CANCELLED').length;
  const volume = success.reduce((sum, t) => sum + t.amount, 0);
  const successRate = (success.length / total * 100).toFixed(1);

  const money = value => '₹' + value.toLocaleString('en-IN');

  const rows = demoTransactions.map(t => `
    <tr>
      <td><code>${t.id}</code></td>
      <td>${t.date}</td>
      <td>${t.customer}</td>
      <td>${money(t.amount)}</td>
      <td><span class="status ${t.status.toLowerCase()}">${t.status}</span></td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>YouPI PG | Merchant Admin Demo</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#f3f6fc;color:#14213d}
header{background:#101d36;color:#fff;padding:22px 5%;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
header strong{font-size:21px}
header a{color:#fff;text-decoration:none;background:#263b61;padding:10px 14px;border-radius:9px}
main{max-width:1250px;margin:32px auto;padding:0 18px}
.notice{background:#fff3cd;color:#795500;padding:16px;border:1px solid #f3d27a;border-radius:12px;line-height:1.6;margin-bottom:24px}
h1{font-size:26px;margin:0 0 8px}
.subtitle{color:#64748b;margin-bottom:24px}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.card,.panel{background:#fff;border-radius:16px;padding:23px;box-shadow:0 6px 25px #1624400d}
.card small{color:#64748b;font-weight:bold}
.value{font-size:29px;font-weight:800;margin-top:14px}
.panel{margin-top:24px}
.table-wrap{overflow-x:auto}
table{border-collapse:collapse;width:100%;min-width:680px}
th,td{text-align:left;padding:15px 12px;border-bottom:1px solid #e2e8f0}
th{background:#f8fafc;color:#64748b;font-size:13px}
.status{padding:7px 10px;border-radius:7px;font-size:12px;font-weight:bold}
.success{background:#dcfce7;color:#166534}
.failed{background:#fee2e2;color:#991b1b}
.cancelled{background:#e2e8f0;color:#475569}
.pending{background:#fef3c7;color:#92400e}
.note{font-size:13px;color:#64748b;line-height:1.6}
footer{text-align:center;padding:28px;color:#64748b;font-size:13px}
@media(max-width:800px){.cards{grid-template-columns:repeat(2,1fr)}}
@media(max-width:450px){.cards{grid-template-columns:1fr}}
</style>
</head>
<body>
<header>
  <strong>⚡ YouPI PG · Merchant Admin Demo</strong>
  <a href="/">← Demo Store</a>
</header>
<main>
  <div class="notice">
    <strong>SIMULATION ONLY — FICTIONAL MERCHANT DATA</strong>
    <div>All transactions, amounts, statuses and customer names shown here are examples.
    This dashboard is not connected to any bank, UPI service, real merchant account or Payment API.</div>
  </div>

  <h1>Merchant Overview</h1>
  <p class="subtitle">Demonstration analytics · Static sample dataset</p>

  <section class="cards" aria-label="Summary metrics">
    <div class="card"><small>Total Demo Transactions</small><div class="value">${total}</div></div>
    <div class="card"><small>Simulated Successful Volume</small><div class="value">${money(volume)}</div></div>
    <div class="card"><small>Demo Success Rate</small><div class="value">${successRate}%</div></div>
    <div class="card"><small>Pending Demo Reviews</small><div class="value">${pending}</div></div>
  </section>

  <section class="panel">
    <h2>Simulated Transaction History</h2>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Transaction ID</th><th>Date</th><th>Customer</th>
          <th>Amount</th><th>Status</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </section>

  <section class="panel">
    <h2>Demo Payment Outcomes</h2>
    <p>Successful: <strong>${success.length}</strong> ·
       Failed: <strong>${failed}</strong> ·
       Cancelled: <strong>${cancelled}</strong> ·
       Pending: <strong>${pending}</strong></p>
    <p class="note">
      The dataset is fixed. Browser-generated checkout simulations do not update
      these records or any actual merchant balance. No settlement or refund
      actions are available.
    </p>
  </section>
</main>
<footer>YouPI PG · Protected Demonstration Dashboard · Not a financial record</footer>
</body>
</html>`;
}

export function handleMerchantAdminDemo(req, res, pathname) {
  if (pathname !== '/admin/demo' && pathname !== '/admin/demo/') {
    return false;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method not allowed', 'text/plain; charset=utf-8', false, {
      Allow: 'GET, HEAD'
    });
    return true;
  }

  if (!username || !password) {
    send(res, 503, 'Demo admin credentials are not configured.');
    return true;
  }

  if (!authorized(req)) {
    send(res, 401, 'Authentication required.', 'text/plain; charset=utf-8', false, {
      'WWW-Authenticate': 'Basic realm="YouPI Merchant Demo", charset="UTF-8"'
    });
    return true;
  }

  send(
    res,
    200,
    renderDashboard(),
    'text/html; charset=utf-8',
    req.method === 'HEAD',
    {
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; " +
        "base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    }
  );

  return true;
}
