import { FiCreditCard, FiCheck, FiClock, FiX, FiArrowRight } from 'react-icons/fi';
import { format } from 'date-fns';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const statusIcons = { Completed: FiCheck, Pending: FiClock, Failed: FiX };
const statusVariants = { Completed: 'success', Pending: 'warning', Failed: 'error' };

const RecentPayments = ({ payments = [], loading = false }) => {
  if (loading) return <Card title="Recent payments"><div className="space-y-3" aria-label="Loading recent payments">{[0,1,2].map(item => <div key={item} className="h-16 animate-pulse rounded-lg bg-base-300" />)}</div></Card>;
  const hasPayments = payments.length > 0;

  return (
    <Card title="Recent payments" badge={String(payments.length)} actions={<Button variant="ghost" size="sm" icon={FiArrowRight} iconPosition="right" onClick={() => { window.location.href = '/Main/AllPayments'; }}>View all</Button>}>
      {!hasPayments ? (
        <div className="py-10 text-center"><span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-base-200"><FiCreditCard className="h-6 w-6 text-base-content/40" /></span><p className="mb-1 text-base-content/65">No recent payments</p><p className="text-sm text-base-content/45">Payments from the last two months will appear here.</p></div>
      ) : (
        <ul className="space-y-2" aria-label="Recent payments">
          {payments.map((payment,index) => <PaymentItem key={payment.id || index} payment={payment} />)}
        </ul>
      )}
      {hasPayments && <div className="mt-5 border-t border-base-300 pt-5"><Button variant="outline" className="w-full" onClick={() => { window.location.href = '/Main/AllPayments'; }}>See all payments</Button></div>}
    </Card>
  );
};

const PaymentItem = ({ payment }) => {
  const StatusIcon = statusIcons[payment.status] || FiClock;
  return (
    <li className="payment-row">
      <span className="payment-icon"><FiCreditCard aria-hidden="true" /></span>
      <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><strong className="truncate text-sm">{payment.type || 'Payment'}</strong><Badge variant={statusVariants[payment.status] || 'default'} size="sm"><span className="flex items-center gap-1"><StatusIcon aria-hidden="true" />{payment.status}</span></Badge></span><small className="text-base-content/50">{formatDate(payment.date)}</small></span>
      <strong className="tabular-nums">BD {Number(payment.amount || 0).toFixed(2)}</strong>
    </li>
  );
};

const formatDate = (value) => { try { return format(new Date(value), 'dd MMM yyyy'); } catch { return value || ''; } };
export default RecentPayments;
