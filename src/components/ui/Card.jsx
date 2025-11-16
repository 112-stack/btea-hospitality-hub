import { motion } from 'framer-motion';
import clsx from 'clsx';

const Card = ({
  children,
  title,
  subtitle,
  badge,
  icon: Icon,
  actions,
  className = '',
  glass = false,
  elevated = true,
  padding = 'default',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'rounded-2xl transition-all duration-300',
        glass ? 'glass-card' : 'bg-white dark:bg-gray-800',
        elevated && 'shadow-lg hover:shadow-xl',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {/* Header */}
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-btea-primary/10">
                <Icon className="w-6 h-6 text-btea-primary" />
              </div>
            )}
            <div>
              {title && (
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                  {badge && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      {badge}
                    </span>
                  )}
                </div>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Content */}
      <div>{children}</div>
    </motion.div>
  );
};

export default Card;
