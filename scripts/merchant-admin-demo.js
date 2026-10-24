import crypto from 'node:crypto';

// Completely isolated demonstration. No payment modules or external APIs.
const username = process.env.DEMO_ADMIN_USER || '';
const password = process.env.DEMO_ADMIN_PASSWORD || '';
const seed = [
  ['2026-10-18','09:15','Demo Customer A',100,'SUCCESS'],
  ['2026-10-18','11:20','Demo Customer B',500,'FAILED'],
  ['2026-10-19','10:30','Demo Customer C',1000,'SUCCESS'],
  ['2026-10-19','14:05','Demo Customer D',2500,'CANCELLED'],
  ['2026-10-20','09:40','Demo Customer E',500,'SUCCESS'],
  ['2026-10-20','16:10','Demo Customer F',100,'SUCCESS'],
  ['2026-10-21','11:02','Demo Customer G',1000,'PENDING'],
  ['2026-10-21','13:20','Demo Customer H',500,'SUCCESS'],
  ['2026-10-22','10:10','Demo Customer I',750,'SUCCESS'],
  ['2026-10-22','12:25','Demo Customer J',1200,'FAILED'],
  ['2026-10-23','15:35','Demo Customer K',250,'SUCCESS'],
  ['2026-10-23','17:15','Demo Customer L',2000,'PENDING'],
  ['2026-10-24','08:20','Demo Customer M',300,'SUCCESS'],
  ['2026-10-24','09:05','Demo Customer N',1500,'SUCCESS'],
  ['2026-10-24','10:45','Demo Customer O',800,'CANCELLED']
];
const transactions = seed.map(([date,time,customer,amount,status],i)=>({
  id:`DEMO-TXN-${1001+i}`,date,time,customer,amount,status
}));
function equal(a,b){
  const x=crypto.createHash('sha256').update(a).digest();
  const y=crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(x,y);
}
function authorized(req){
  if(!username || !password) return false;
  const h=req.headers.authorization || '';
  if(!h.startsWith('Basic ')) return false;
  try {
    const encoded=h.slice(6).trim();
    if(!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return false;
    const decoded=Buffer.from(encoded,'base64').toString('utf8');
    const pos=decoded.indexOf(':');
    return pos>=0 && equal(decoded.slice(0,pos),username) && equal(decoded.slice(pos+1),password);
  } catch { return false; }
}
function send(res,code,body,head=false,headers={}){
  res.writeHead(code,{
    'Content-Type':'text/html; charset=utf-8',
    'Cache-Control':'no-store, private',
    'X-Content-Type-Options':'nosniff',
    'X-Frame-Options':'DENY',
    'Referrer-Policy':'no-referrer',
    ...headers
  });
  res.end(head?undefined:body);
}
function dashboard(){
  const json=JSON.stringify(transactions).replace(/</g,'\\u003c');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>YouPI PG | Demo Merchant Operations Center</title>
<style>
:root{--bg:#f3f6fc;--ink:#17243c;--muted:#64748b;--line:#dfe6f1;--navy:#111d37;--blue:#2563eb}
*{box-sizing:border-box}body{margin:0;background:var(--bg);font:14px/1.5 system-ui,Segoe UI,Arial,sans-serif;color:var(--ink)}
header{background:var(--navy);color:white;padding:20px max(20px,calc((100% - 1250px)/2));display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
header strong{font-size:20px}header a{color:white;text-decoration:none;background:#304467;padding:10px 14px;border-radius:9px}
main{max-width:1290px;padding:22px 20px;margin:auto}.notice{background:#fff4d7;color:#805600;border:1px solid #f0d58b;padding:15px;border-radius:12px;margin-bottom:20px}
h1{font-size:26px;margin:0 0 5px}h2{font-size:18px;margin:0 0 16px}.muted{color:var(--muted)}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.card,.panel{background:white;border:1px solid var(--line);border-radius:14px;padding:20px;box-shadow:0 6px 20px #10204009}.card .value{font-size:27px;font-weight:800;margin-top:8px}
.panel{margin-top:18px}.toolbar{display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:10px;align-items:end}label{display:block;font-weight:650;font-size:12px;color:var(--muted);margin-bottom:5px}
input,select{font:inherit;width:100%;min-height:40px;padding:8px;border:1px solid #cbd5e1;border-radius:8px;background:white;color:var(--ink)}button{font:inherit;font-weight:650;background:var(--blue);color:white;border:0;border-radius:8px;padding:10px 13px;cursor:pointer}button.secondary{background:#e2e8f0;color:var(--ink)}button:disabled{opacity:.45;cursor:not-allowed}
.actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:space-between;align-items:center}.actions .right{display:flex;gap:9px;flex-wrap:wrap}
.tablewrap{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:760px}th,td{border-bottom:1px solid var(--line);padding:11px 9px;text-align:left}th{font-size:12px;color:var(--muted);background:#f8fafc}td button{padding:6px 9px;font-size:12px}.status{display:inline-block;padding:4px 8px;border-radius:7px;font-size:11px;font-weight:800}.SUCCESS{background:#dcfce7;color:#166534}.FAILED{background:#fee2e2;color:#991b1b}.PENDING{background:#fef3c7;color:#92400e}.CANCELLED{background:#e2e8f0;color:#475569}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}.barrow{display:grid;grid-template-columns:105px 1fr 70px;gap:9px;align-items:center;margin:10px 0;font-size:12px}.track{height:15px;background:#e2e8f0;border-radius:5px;overflow:hidden}.fill{height:100%;background:#2563eb}.pager{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:15px}
dialog{border:0;border-radius:16px;padding:24px;width:min(560px,calc(100% - 30px));box-shadow:0 25px 80px #101d3766;color:var(--ink)}dialog::backdrop{background:#0f172a99}.detail{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.detail strong{text-align:right}.dialog-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:18px}
#report,#refundPrintReport{display:none}.report-title{font-size:23px;font-weight:800}.report-watermark{font-weight:800;color:#9a3412}.hint{font-size:12px;color:var(--muted)}.refund-controls{display:flex;gap:10px;flex-wrap:wrap;align-items:end}.refund-controls input{max-width:300px}.refund-controls button{white-space:nowrap}.refund-summary{display:flex;gap:18px;flex-wrap:wrap;margin:12px 0}.refund-summary strong{font-size:17px}.refund-empty{padding:15px;color:var(--muted)}footer{text-align:center;padding:25px;color:var(--muted)}
@media(max-width:900px){.toolbar{grid-template-columns:repeat(2,1fr)}.cards{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.cards,.grid2,.toolbar{grid-template-columns:1fr}main{padding:14px}.card,.panel{padding:15px}}
@media print{header,.notice,.cards,.panel,.pager,footer,dialog{display:none!important}body{background:white}main{max-width:none;padding:0}body.print-transactions #report,body.print-refunds #refundPrintReport{display:block!important}.report-watermark{font-size:17px}#report table,#refundPrintReport table{min-width:0;font-size:10px}#report th,#report td,#refundPrintReport th,#refundPrintReport td{padding:5px} @page{size:A4;margin:13mm}}
</style></head><body>
<header><strong>⚡ YouPI PG · Demo Operations Center</strong><a href="/">← Demo Store</a></header>
<main><div class="notice"><b>SIMULATION ONLY — NO REAL PAYMENTS OR REFUNDS.</b> Every transaction and settlement is fictional. Demo refunds change browser-memory data only and are never sent to any server, bank or payment API.</div>
<h1>Merchant Operations Center</h1><p class="muted">Protected demonstration · Fictional records · Browser-only changes</p>
<section class="cards">
<div class="card"><span class="muted">Filtered transactions</span><div class="value" id="count">0</div></div>
<div class="card"><span class="muted">Simulated successful volume</span><div class="value" id="volume">₹0</div></div>
<div class="card"><span class="muted">Simulated refunds</span><div class="value" id="refunds">₹0</div></div>
<div class="card"><span class="muted">Net simulated volume</span><div class="value" id="net">₹0</div></div>
</section>
<section class="panel"><h2>Search and Filters</h2><div class="toolbar">
<div><label for="q">Transaction ID / Customer</label><input id="q" type="search" placeholder="Search fictional records"></div>
<div><label for="status">Status</label><select id="status"><option value="ALL">All statuses</option><option>SUCCESS</option><option>FAILED</option><option>PENDING</option><option>CANCELLED</option></select></div>
<div><label for="start">Start date</label><input id="start" type="date"></div>
<div><label for="end">End date</label><input id="end" type="date"></div>
<button id="reset" class="secondary">Reset</button></div><p id="filterNote" class="hint" role="status"></p></section>
<section class="grid2"><div class="panel"><h2>Outcome Distribution</h2><div id="outcomes"></div></div><div class="panel"><h2>Demo Settlement Report</h2><div id="settlements"></div><p class="hint">Illustrative grouping by transaction date; no actual settlement, payout, fee or bank reconciliation.</p></div></section>
<section class="panel"><div class="actions"><div><h2>Transaction History</h2><span class="hint" id="resultCount"></span></div><div class="right"><button id="csv">Export filtered CSV</button><button id="print">Print demo report</button></div></div>
<div class="tablewrap"><table><thead><tr><th>ID</th><th>Date</th><th>Customer</th><th>Amount</th><th>Status</th><th>Demo refund</th><th>Details</th></tr></thead><tbody id="rows"></tbody></table></div>
<div class="pager"><label for="pageSize">Rows</label><select id="pageSize" style="width:auto"><option>5</option><option selected>10</option><option>20</option></select><button id="prev" class="secondary">Previous</button><span id="pageInfo"></span><button id="next" class="secondary">Next</button></div></section>
<section class="panel" aria-label="Demo refund history">
<div class="actions"><div><h2>Simulated Refund History</h2><span class="hint">Browser-tab session storage: refunds survive refresh, but not a new session. No real refunds occur.</span></div><div class="right"><button id="refundCsv">Download refund report CSV</button><button id="refundPrint" class="secondary">Print refund report</button></div></div>
<div class="refund-summary"><div>Refunds recorded: <strong id="refundCount">0</strong></div><div>Total fictional refunds: <strong id="refundAmount">₹0</strong></div><div>Net fictional volume: <strong id="refundNet">₹5,000</strong></div></div>
<div class="refund-controls"><div><label for="refundSearch">Search refund ID / transaction ID</label><input id="refundSearch" type="search" placeholder="e.g. DEMO-RFD-0001"></div><button id="refundClear" class="secondary">Clear search</button></div>
<div class="tablewrap"><table><thead><tr><th>Refund ID</th><th>Transaction ID</th><th>Amount</th><th>Timestamp</th><th>Status</th></tr></thead><tbody id="refundRows"></tbody></table></div>
<p id="refundEmpty" class="refund-empty" role="status">No simulated refunds recorded yet.</p>
</section>
<section id="refundPrintReport"><div class="report-title">YouPI PG — Simulated Refund History</div><p class="report-watermark">DEMO ONLY — NOT A FINANCIAL DOCUMENT</p><p id="refundPrintSummary"></p><table><thead><tr><th>Refund ID</th><th>Transaction ID</th><th>Amount</th><th>Timestamp</th><th>Status</th></tr></thead><tbody id="refundPrintRows"></tbody></table><p>No actual money was refunded.</p></section>
<section id="report"><div class="report-title">YouPI PG — Merchant Operations Demo Report</div><p class="report-watermark">SIMULATED DATA — NOT A FINANCIAL DOCUMENT</p><p id="reportSummary"></p><table><thead><tr><th>ID</th><th>Date</th><th>Customer</th><th>Amount</th><th>Status</th><th>Refund</th></tr></thead><tbody id="reportRows"></tbody></table><p>No actual payments, refunds or settlements occurred.</p></section>
</main><dialog id="detailDialog"><h2>Fictional Transaction Details</h2><div id="detailBody"></div><p class="hint">Any refund is a temporary visual simulation. Refunds survive refresh in this browser tab; closing the tab ends the session.</p><div class="dialog-actions"><button id="refundButton">Simulate Full Refund</button><button id="closeDialog" class="secondary">Close</button></div></dialog>
<footer>YOUPI PG · DEMO ONLY · No real financial activity</footer>
<script>
'use strict';
const transactions=${json}.map(t=>({...t,refund:0}));
const el=id=>document.getElementById(id);
const INR=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'});
const money=n=>INR.format(n);
const statusNames=['SUCCESS','FAILED','PENDING','CANCELLED'];
let filtered=[],page=1,selectedId=null;
const refundHistory=[];
let refundSequence=0;
// Browser-only, per-tab persistence. Never stores credentials or real payment data.
const DEMO_STORAGE_KEY='youpi-demo-refunds-v1';
function restoreDemoRefunds(){
 try {
  const raw=sessionStorage.getItem(DEMO_STORAGE_KEY);
  if(!raw)return;
  const saved=JSON.parse(raw);
  if(!saved||saved.version!==1||!Array.isArray(saved.refunds)||saved.refunds.length>transactions.length)return;
  const seen=new Set();
  const valid=[];
  for(const r of saved.refunds){
   if(!r||typeof r!=='object')return;
   const t=transactions.find(t=>t.id===r.transactionId);
   if(!t||t.status!=='SUCCESS'||seen.has(t.id)||r.amount!==t.amount||
      typeof r.id!=='string'||!/^DEMO-RFD-[0-9]{4,}$/.test(r.id)||
      typeof r.timestamp!=='string'||!Number.isFinite(Date.parse(r.timestamp))||
      r.status!=='SIMULATED REFUND')return;
   seen.add(t.id);valid.push({id:r.id,transactionId:t.id,amount:t.amount,timestamp:r.timestamp,status:'SIMULATED REFUND'});
  }
  if(new Set(valid.map(r=>r.id)).size!==valid.length)return;
  valid.forEach(r=>{transactions.find(t=>t.id===r.transactionId).refund=r.amount;refundHistory.push(r)});
  refundSequence=valid.reduce((n,r)=>Math.max(n,Number(r.id.slice('DEMO-RFD-'.length))),0);
 }catch{/* Storage may be disabled or unavailable; in-memory demo still works. */}
}
function saveDemoRefunds(){
 try{sessionStorage.setItem(DEMO_STORAGE_KEY,JSON.stringify({version:1,refunds:refundHistory}));}
 catch{/* Storage may be disabled or full; in-memory demo still works. */}
}
restoreDemoRefunds();
function filterData(){
 const q=el('q').value.trim().toLowerCase(),s=el('status').value,a=el('start').value,b=el('end').value;
 if(a&&b&&a>b){el('filterNote').textContent='Start date cannot be later than end date.';return []}
 el('filterNote').textContent='All values are fictional. Demo refunds are saved for this browser-tab session only.';
 return transactions.filter(t=>(t.id.toLowerCase().includes(q)||t.customer.toLowerCase().includes(q))&&(s==='ALL'||t.status===s)&&(!a||t.date>=a)&&(!b||t.date<=b));
}
function metrics(){
 const successes=filtered.filter(t=>t.status==='SUCCESS');
 const volume=successes.reduce((n,t)=>n+t.amount,0);
 const refunds=successes.reduce((n,t)=>n+t.refund,0);
 el('count').textContent=filtered.length;el('volume').textContent=money(volume);el('refunds').textContent=money(refunds);el('net').textContent=money(volume-refunds);
 return {volume,refunds,net:volume-refunds};
}
function bar(container,label,value,max,suffix){
 const row=document.createElement('div');row.className='barrow';
 const name=document.createElement('span');name.textContent=label;
 const track=document.createElement('div');track.className='track';
 const fill=document.createElement('div');fill.className='fill';fill.style.width=(max?100*value/max:0)+'%';track.append(fill);
 const count=document.createElement('strong');count.textContent=suffix||String(value);count.title=count.textContent;
 row.append(name,track,count);container.append(row);
}
function charts(){
 const a=el('outcomes'),b=el('settlements');a.replaceChildren();b.replaceChildren();
 const counts=statusNames.map(s=>filtered.filter(t=>t.status===s).length);
 statusNames.forEach((s,i)=>bar(a,s,counts[i],Math.max(1,...counts)));
 const groups=new Map();
 filtered.filter(t=>t.status==='SUCCESS').forEach(t=>{
  const g=groups.get(t.date)||{gross:0,refund:0};g.gross+=t.amount;g.refund+=t.refund;groups.set(t.date,g);
 });
 const dates=[...groups.keys()].sort();const max=Math.max(1,...dates.map(d=>groups.get(d).gross-groups.get(d).refund));
 if(!dates.length){b.textContent='No simulated successful transactions in this selection.';return}
 dates.forEach(d=>{const g=groups.get(d);bar(b,d,g.gross-g.refund,max,money(g.gross-g.refund))});
}
function cell(tr,text){const td=document.createElement('td');td.textContent=String(text);tr.append(td);return td}
function renderTable(){
 const size=Number(el('pageSize').value),pages=Math.max(1,Math.ceil(filtered.length/size));page=Math.min(page,pages);
 const subset=filtered.slice((page-1)*size,page*size),body=el('rows');body.replaceChildren();
 for(const t of subset){
  const tr=document.createElement('tr');cell(tr,t.id);cell(tr,t.date+' '+t.time);cell(tr,t.customer);cell(tr,money(t.amount));
  const st=cell(tr,t.status);st.className='status '+t.status;
  cell(tr,t.refund?money(t.refund):'—');
  const td=document.createElement('td'),btn=document.createElement('button');btn.textContent='View';btn.addEventListener('click',()=>openDetail(t.id));td.append(btn);tr.append(td);body.append(tr);
 }
 el('resultCount').textContent=filtered.length+' of '+transactions.length+' fictional records';
 el('pageInfo').textContent='Page '+page+' of '+pages;
 el('prev').disabled=page<=1;el('next').disabled=page>=pages;
 el('csv').disabled=!filtered.length;el('print').disabled=!filtered.length;
}
function refresh(resetPage=false){if(resetPage)page=1;filtered=filterData();metrics();charts();renderTable()}
function openDetail(id){
 const t=transactions.find(x=>x.id===id);if(!t)return;selectedId=id;
 const body=el('detailBody');body.replaceChildren();
 for(const [label,value] of [['Transaction ID',t.id],['Customer',t.customer],['Date',t.date+' '+t.time],['Amount',money(t.amount)],['Status',t.status],['Demo refund',money(t.refund)]]){
  const row=document.createElement('div');row.className='detail';const a=document.createElement('span');a.textContent=label;const b=document.createElement('strong');b.textContent=value;row.append(a,b);body.append(row);
 }
 el('refundButton').disabled=t.status!=='SUCCESS'||t.refund>0;
 el('refundButton').textContent=t.refund?'Demo refund already recorded':'Simulate Full Refund';
 el('detailDialog').showModal();
}
function refund(){
 const t=transactions.find(x=>x.id===selectedId);
 if(!t||t.status!=='SUCCESS'||t.refund)return;
 if(!confirm('SIMULATION ONLY: Mark '+t.id+' as fully refunded in this browser session? No money will move.'))return;
 t.refund=t.amount;
 refundSequence+=1;
 const refundId='DEMO-RFD-'+String(refundSequence).padStart(4,'0');
 refundHistory.push({id:refundId,transactionId:t.id,amount:t.amount,timestamp:new Date().toISOString(),status:'SIMULATED REFUND'});
 saveDemoRefunds();
 el('detailDialog').close();refresh();renderRefundHistory();
}
function csvCell(value){let v=String(value);if(/^[\\s\\x00-\\x1f]*[=+@-]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'}
function exportCSV(){
 if(!filtered.length)return;
 const records=[['DEMO ONLY — NOT A FINANCIAL RECORD'],['Transaction ID','Date','Time','Customer','Amount INR','Status','Simulated Refund INR'],...filtered.map(t=>[t.id,t.date,t.time,t.customer,t.amount,t.status,t.refund])];
 const content='\\uFEFF'+records.map(r=>r.map(csvCell).join(',')).join('\\r\\n');
 const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='youpi-operations-DEMO.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function visibleRefunds(){
 const q=el('refundSearch').value.trim().toLowerCase();
 return refundHistory.filter(r=>r.id.toLowerCase().includes(q)||r.transactionId.toLowerCase().includes(q));
}
function refundRow(body,r){
 const tr=document.createElement('tr');
 [r.id,r.transactionId,money(r.amount),new Date(r.timestamp).toLocaleString('en-IN'),r.status].forEach(v=>cell(tr,v));
 body.append(tr);
}
function renderRefundHistory(){
 const matches=visibleRefunds();
 const body=el('refundRows');body.replaceChildren();
 matches.forEach(r=>refundRow(body,r));
 const total=refundHistory.reduce((n,r)=>n+r.amount,0);
 const gross=transactions.filter(t=>t.status==='SUCCESS').reduce((n,t)=>n+t.amount,0);
 el('refundCount').textContent=String(refundHistory.length);
 el('refundAmount').textContent=money(total);
 el('refundNet').textContent=money(gross-total);
 el('refundEmpty').hidden=matches.length>0;
 el('refundEmpty').textContent=refundHistory.length?'No refunds match your search.':'No simulated refunds recorded yet.';
 el('refundCsv').disabled=matches.length===0;
 el('refundPrint').disabled=matches.length===0;
}
function exportRefundCSV(){
 const matches=visibleRefunds();if(!matches.length)return;
 const records=[['Refund ID','Transaction ID','Amount INR','Timestamp (ISO 8601)','Status','Disclaimer'],
 ...matches.map(r=>[r.id,r.transactionId,r.amount,r.timestamp,r.status,'DEMO ONLY - NOT A FINANCIAL RECORD'])];
 const content='\\uFEFF'+records.map(row=>row.map(csvCell).join(',')).join('\\r\\n');
 const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='youpi-refund-history-DEMO.csv';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function printRefundReport(){
 const matches=visibleRefunds();if(!matches.length)return;
 const body=el('refundPrintRows');body.replaceChildren();matches.forEach(r=>refundRow(body,r));
 const total=matches.reduce((n,r)=>n+r.amount,0);
 el('refundPrintSummary').textContent='Fictional refund records: '+matches.length+' | Simulated refund total: '+money(total);
 document.body.classList.remove('print-transactions');document.body.classList.add('print-refunds');
 window.print();
}
window.addEventListener('afterprint',()=>document.body.classList.remove('print-transactions','print-refunds'));
function printReport(){
 if(!filtered.length)return;
 const totals=metrics();el('reportSummary').textContent='Filtered records: '+filtered.length+' | Successful volume: '+money(totals.volume)+' | Simulated refunds: '+money(totals.refunds)+' | Net demo volume: '+money(totals.net);
 const body=el('reportRows');body.replaceChildren();for(const t of filtered){const tr=document.createElement('tr');[t.id,t.date,t.customer,money(t.amount),t.status,money(t.refund)].forEach(v=>cell(tr,v));body.append(tr)}
 document.body.classList.remove('print-refunds');document.body.classList.add('print-transactions');
 window.print();
}
for(const id of ['q','status','start','end']){el(id).addEventListener('input',()=>refresh(true));el(id).addEventListener('change',()=>refresh(true))}
el('reset').addEventListener('click',()=>{el('q').value='';el('status').value='ALL';el('start').value='';el('end').value='';refresh(true)});
el('pageSize').addEventListener('change',()=>refresh(true));
el('prev').addEventListener('click',()=>{page--;renderTable()});el('next').addEventListener('click',()=>{page++;renderTable()});
el('closeDialog').addEventListener('click',()=>el('detailDialog').close());el('refundButton').addEventListener('click',refund);
el('csv').addEventListener('click',exportCSV);el('print').addEventListener('click',printReport);
el('refundSearch').addEventListener('input',renderRefundHistory);
el('refundClear').addEventListener('click',()=>{el('refundSearch').value='';renderRefundHistory()});
el('refundCsv').addEventListener('click',exportRefundCSV);
el('refundPrint').addEventListener('click',printRefundReport);
refresh(true);renderRefundHistory();
</script></body></html>`;
}
export function handleMerchantAdminDemo(req,res,pathname){
  if(pathname!=='/admin/demo'&&pathname!=='/admin/demo/')return false;
  if(req.method!=='GET'&&req.method!=='HEAD'){
    send(res,405,'Method not allowed',false,{'Allow':'GET, HEAD'});return true;
  }
  if(!username||!password){send(res,503,'Demo admin credentials are not configured.');return true;}
  if(!authorized(req)){
    send(res,401,'Authentication required.',false,{'WWW-Authenticate':'Basic realm="YouPI Merchant Demo", charset="UTF-8"'});return true;
  }
  send(res,200,dashboard(),req.method==='HEAD',{
    'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; img-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
  });return true;
}
