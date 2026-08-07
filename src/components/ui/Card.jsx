import clsx from 'clsx';

const Card = ({ children, title, subtitle, badge, icon: Icon, actions, className = '', glass = false, elevated = true, padding = 'default', ...props }) => {
  const paddingClasses = { none: '', sm: 'p-4', default: 'p-6', lg: 'p-8' };
  return (
    <section className={clsx('rounded-2xl border border-base-300 bg-base-100', glass && 'glass-card', elevated && 'shadow-sm', paddingClasses[padding], className)} {...props}>
      {(title || subtitle || actions) && (
        <header className="mb-5 flex items-start justify-between gap-4 border-b border-base-300 pb-4">
          <div className="flex items-center gap-3">
            {Icon && <span className="grid h-9 w-9 place-items-center rounded-lg bg-btea-primary/10"><Icon className="h-5 w-5 text-btea-primary" aria-hidden="true" /></span>}
            <div>{title && <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-base-content">{title}</h2>{badge !== undefined && <span className="rounded-full bg-base-200 px-2 py-1 text-xs font-semibold text-base-content/60">{badge}</span>}</div>}{subtitle && <p className="mt-1 text-sm text-base-content/55">{subtitle}</p>}</div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
};

export default Card;
