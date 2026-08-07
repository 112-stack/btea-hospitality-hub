import clsx from 'clsx';

const iconColors = { primary: 'text-btea-primary', secondary: 'text-orange-600', accent: 'text-emerald-600', purple: 'text-purple-600' };
const trendColors = { up: 'text-green-700 bg-green-100', down: 'text-red-700 bg-red-100', neutral: 'text-gray-600 bg-gray-100' };

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, gradient = 'primary', link, sparklineData, className = '' }) => {
  const content = (
    <article className={clsx('metric-card', className)}>
      <div className="mb-4 flex items-start justify-between">
        <span className={clsx('metric-icon', iconColors[gradient])}>{Icon && <Icon aria-hidden="true" />}</span>
        {trend && <span className={clsx('rounded-full px-2 py-1 text-xs font-semibold', trendColors[trend])}><span className="sr-only">Trend: </span>{trendValue}</span>}
      </div>
      <strong className="block text-4xl font-bold tabular-nums text-base-content">{Number(value || 0).toLocaleString()}</strong>
      <span className="mt-1 block text-sm font-medium text-base-content/60">{title}</span>
      {sparklineData?.length > 1 && (
        <svg className={clsx('mt-4 h-9 w-full', iconColors[gradient])} viewBox="0 0 100 30" preserveAspectRatio="none" role="img" aria-label={`${title} recent trend`}>
          <polyline fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" points={sparklineData.map((item,index) => `${(index/(sparklineData.length-1))*100},${30-item}`).join(' ')} />
        </svg>
      )}
    </article>
  );
  return link ? <a href={link} className="block rounded-2xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btea-primary focus-visible:ring-offset-2">{content}</a> : content;
};

export default StatsCard;
