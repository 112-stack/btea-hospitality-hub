import clsx from 'clsx';

const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, iconPosition = 'left', loading = false, disabled = false, className = '', ...props }) => {
  const variants = { primary: 'btn-btea', outline: 'btn-btea-outline', ghost: 'btn-btea-ghost', danger: 'bg-red-600 hover:bg-red-700 text-white', success: 'bg-green-600 hover:bg-green-700 text-white' };
  const sizes = { sm: 'px-3 py-2 text-sm', md: 'px-4 py-2.5 text-base', lg: 'px-5 py-3 text-lg' };
  return (
    <button className={clsx('relative inline-flex min-h-9 items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus-btea disabled:cursor-not-allowed disabled:opacity-50', variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
      {!loading && Icon && iconPosition === 'left' && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
};

export default Button;
