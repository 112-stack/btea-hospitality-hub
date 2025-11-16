import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  gradient = 'primary',
  link,
  delay = 0,
  sparklineData = null,
  className = '',
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const gradients = {
    primary: 'from-btea-primary/20 via-btea-primary/10 to-transparent',
    secondary: 'from-orange-400/20 via-orange-300/10 to-transparent',
    accent: 'from-emerald-400/20 via-emerald-300/10 to-transparent',
    purple: 'from-purple-400/20 via-purple-300/10 to-transparent',
  };

  const iconColors = {
    primary: 'text-btea-primary',
    secondary: 'text-orange-500',
    accent: 'text-emerald-500',
    purple: 'text-purple-500',
  };

  const trendColors = {
    up: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    down: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    neutral: 'text-gray-600 bg-gray-100 dark:bg-gray-700',
  };

  const CardContent = () => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={clsx(
        'glass-card-hover relative overflow-hidden p-6 group cursor-pointer',
        className
      )}
    >
      {/* Animated Background Gradient */}
      <div
        className={clsx(
          'absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-300 group-hover:opacity-70',
          gradients[gradient]
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div
            className={clsx(
              'p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm',
              'transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3'
            )}
          >
            {Icon && <Icon className={clsx('w-8 h-8', iconColors[gradient])} />}
          </div>

          {/* Trend Badge */}
          {trend && (
            <div
              className={clsx(
                'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                trendColors[trend]
              )}
            >
              {trend === 'up' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {trendValue}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
            {inView ? (
              <CountUp end={value} duration={2} separator="," />
            ) : (
              0
            )}
          </h3>
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>

        {/* Sparkline (Optional) */}
        {sparklineData && (
          <div className="mt-4">
            <svg
              className="w-full h-12"
              viewBox="0 0 100 30"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={iconColors[gradient]}
                points={sparklineData
                  .map((val, i) => `${(i / (sparklineData.length - 1)) * 100},${30 - val}`)
                  .join(' ')}
              />
            </svg>
          </div>
        )}
      </div>

      {/* Hover Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
    </motion.div>
  );

  if (link) {
    return (
      <Link to={link} className="block">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

export default StatsCard;
