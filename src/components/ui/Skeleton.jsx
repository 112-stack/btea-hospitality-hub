import clsx from 'clsx';

const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const variants = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div
      className={clsx(
        'skeleton animate-pulse',
        variants[variant],
        className
      )}
    />
  );
};

export const SkeletonCard = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton variant="circular" className="w-12 h-12" />
      <Skeleton className="w-16 h-6" />
    </div>
    <Skeleton className="w-20 h-10" />
    <Skeleton variant="text" className="w-3/4" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="w-full h-16" />
      </div>
    ))}
  </div>
);

export default Skeleton;
