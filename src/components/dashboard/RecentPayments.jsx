import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiCheck, FiClock, FiX, FiArrowRight } from 'react-icons/fi';
import { format } from 'date-fns';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import clsx from 'clsx';

const RecentPayments = ({ payments = [], loading = false }) => {
  const getPaymentIcon = (method) => {
    return <FiCreditCard className="w-5 h-5" />;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Completed': <FiCheck className="w-4 h-4" />,
      'Pending': <FiClock className="w-4 h-4" />,
      'Failed': <FiX className="w-4 h-4" />,
    };
    return icons[status] || <FiClock className="w-4 h-4" />;
  };

  const getStatusVariant = (status) => {
    const variants = {
      'Completed': 'success',
      'Pending': 'warning',
      'Failed': 'error',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <Card title="Recent Payments" badge="1">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const hasRecentPayments = payments && payments.length > 0;

  return (
    <Card
      title="Recent Payments"
      badge={hasRecentPayments ? payments.length.toString() : '0'}
      actions={
        <Button
          variant="ghost"
          size="sm"
          icon={FiArrowRight}
          iconPosition="right"
          onClick={() => window.location.href = '/Main/AllPayments'}
        >
          View All
        </Button>
      }
    >
      <AnimatePresence mode="wait">
        {!hasRecentPayments ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <FiCreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              No recent payments
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Payments from the last 2 months will appear here
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="payments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {payments.map((payment, index) => (
              <PaymentItem
                key={payment.id || index}
                payment={payment}
                index={index}
                getPaymentIcon={getPaymentIcon}
                getStatusIcon={getStatusIcon}
                getStatusVariant={getStatusVariant}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {hasRecentPayments && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = '/Main/AllPayments'}
          >
            See All Payments
          </Button>
        </div>
      )}
    </Card>
  );
};

const PaymentItem = ({
  payment,
  index,
  getPaymentIcon,
  getStatusIcon,
  getStatusVariant,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group relative flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
  >
    {/* Payment Icon */}
    <div className={clsx(
      "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
      "bg-gradient-to-br from-btea-primary to-btea-primary-dark text-white",
      "transform transition-transform group-hover:scale-110"
    )}>
      {getPaymentIcon(payment.method)}
    </div>

    {/* Payment Details */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <p className="font-semibold text-gray-900 dark:text-white truncate">
          {payment.type || 'Payment'}
        </p>
        <Badge variant={getStatusVariant(payment.status)} size="sm">
          <span className="flex items-center gap-1">
            {getStatusIcon(payment.status)}
            {payment.status}
          </span>
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>{formatDate(payment.date)}</span>
        {payment.reference && (
          <>
            <span>•</span>
            <span className="truncate">{payment.reference}</span>
          </>
        )}
      </div>
    </div>

    {/* Amount */}
    <div className="text-right">
      <p className="font-bold text-lg text-gray-900 dark:text-white">
        BD {payment.amount?.toFixed(2) || '0.00'}
      </p>
      {payment.method && (
        <p className="text-xs text-gray-500">{payment.method}</p>
      )}
    </div>

    {/* Hover Arrow */}
    <FiArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
);

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'dd MMM yyyy');
  } catch {
    return dateString;
  }
};

export default RecentPayments;
