import { useState } from 'react';
import { FiCreditCard, FiDownload, FiExternalLink } from 'react-icons/fi';
import { getOfficialService } from '../data/officialServices';
import usePortalStore from '../stores/portalStore';

const Payments = () => {
  const [receiptNotice, setReceiptNotice] = useState('Select a demonstration receipt to preview its reference.');
  const payments = usePortalStore((state) => state.payments);
  const paidTotal = payments.filter((payment) => payment.status === 'Paid').reduce((sum, payment) => sum + payment.amount, 0);
  return (
    <div>
      <header className="page-heading-row"><div><span className="page-eyebrow">Financial library</span><h1>Payments</h1><p>Review levy, license, permit, and violation-payment readiness without processing money in this demonstration.</p></div><a className="secondary-action" href="https://portal.btea.bh/Login/LoginWithEkey" target="_blank" rel="noreferrer">Official payment login <FiExternalLink aria-hidden="true" /></a></header>
      <section className="payment-summary" aria-label="Payment summary"><article><span>Paid in demo data</span><strong>BHD {paidTotal.toLocaleString()}</strong><small>{payments.filter((item) => item.status === 'Paid').length} receipts</small></article><article><span>Ready for official payment</span><strong>{payments.filter((item) => item.status === 'Ready').length}</strong><small>No money processed locally</small></article><article><span>Payment security</span><strong>External</strong><small>Official BTEA/eKey flow only</small></article></section>
      <div className="inline-notice" role="status">{receiptNotice}</div>
      <section className="workspace-card" aria-labelledby="payment-list-title"><div className="workspace-card-header"><div><span className="page-eyebrow">Ledger</span><h2 id="payment-list-title">Payment activity</h2></div><FiCreditCard aria-hidden="true" /></div>
        <div className="overflow-x-auto"><table className="portal-table"><caption className="sr-only">Local demonstration payment activity</caption><thead><tr><th>Reference</th><th>Service</th><th>Date</th><th>Amount</th><th>Status</th><th className="text-right">Receipt</th></tr></thead><tbody>{payments.map((payment) => { const service = getOfficialService(payment.serviceId); return <tr key={payment.id}><td><strong>{payment.id}</strong></td><td>{service?.title || 'BTEA service'}</td><td>{new Date(payment.date).toLocaleDateString('en-GB')}</td><td>BHD {payment.amount.toLocaleString()}</td><td><span className={`status-pill ${payment.status === 'Paid' ? 'success' : 'warning'}`}>{payment.status}</span></td><td className="text-right">{payment.receipt ? <button type="button" className="table-action" onClick={() => setReceiptNotice(`Demonstration receipt ${payment.receipt} is available in this working copy; no official receipt was downloaded.`)}><FiDownload aria-hidden="true" /> Demo receipt</button> : <a className="table-action" href={service?.sourceUrl} target="_blank" rel="noreferrer">Official flow</a>}</td></tr>; })}</tbody></table></div>
      </section>
      <div className="safety-note">Payment records are representative local data. Real fees, settlement amounts, receipts, and payment authorization must be handled by the official authenticated portal.</div>
    </div>
  );
};

export default Payments;
