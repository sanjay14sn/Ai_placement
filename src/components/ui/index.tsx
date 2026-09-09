import React from 'react';
import { cn } from '../../utils';

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ai' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500 shadow-sm hover:shadow-brand rounded-xl',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 focus:ring-slate-400 rounded-xl',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400 rounded-xl',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 rounded-xl',
    ai: 'bg-gradient-to-r from-ai-600 to-brand-600 hover:from-ai-700 hover:to-brand-700 text-white focus:ring-ai-500 shadow-sm rounded-xl',
    outline: 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-400 rounded-xl',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'slate' | 'indigo' | 'ai';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', className, dot }) => {
  const variants = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    purple: 'bg-ai-100 text-ai-700 dark:bg-ai-900/40 dark:text-ai-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    indigo: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    ai: 'bg-gradient-to-r from-ai-100 to-brand-100 text-ai-700 dark:from-ai-900/40 dark:to-brand-900/40 dark:text-ai-300',
  };

  const dotColors = {
    blue: 'bg-blue-500', green: 'bg-emerald-500', red: 'bg-red-500',
    amber: 'bg-amber-500', purple: 'bg-ai-500', slate: 'bg-slate-500',
    indigo: 'bg-brand-500', ai: 'bg-ai-500',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const colors = [
    'bg-brand-100 text-brand-700', 'bg-ai-100 text-ai-700',
    'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700', 'bg-cyan-100 text-cyan-700',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />;
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold flex-shrink-0', sizes[size], colors[colorIndex], className)}>
      {initials}
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover, onClick, padding = true }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700',
        hover && 'hover:shadow-elevated transition-shadow duration-200 cursor-pointer',
        onClick && 'cursor-pointer',
        padding && 'p-6',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelClassName, error, hint, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={cn("block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5", labelClassName)}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-150',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-red-300 dark:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  }
);

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelClassName?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ label, labelClassName, error, options, placeholder, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className={cn("block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5", labelClassName)}>
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-150 appearance-none',
          error && 'border-red-300 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <textarea
        ref={ref}
        className={cn('w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-150 resize-none', error && 'border-red-300 focus:ring-red-500', className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────

interface ProgressProps {
  value: number;
  max?: number;
  color?: 'brand' | 'ai' | 'green' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  color = 'brand',
  size = 'md',
  showLabel,
  className,
  animated,
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    brand: 'bg-brand-600',
    ai: 'bg-gradient-to-r from-ai-500 to-brand-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  const sizes = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">{value}%</span>
        </div>
      )}
      <div className={cn('w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', colors[color], animated && 'animate-pulse-slow')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// ─── Progress Ring (Circular) ─────────────────────────────────────────────────

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  labelColor?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 80,
  strokeWidth = 6,
  color = '#4f46e5',
  label,
  sublabel,
  labelColor,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-700 opacity-30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className={cn("text-sm font-bold leading-none", labelColor || "text-slate-900 dark:text-slate-100")}>{label}</span>}
        {sublabel && <span className={cn("text-[10px]", labelColor ? "opacity-80" : "text-slate-500 dark:text-slate-400")}>{sublabel}</span>}
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  color?: 'brand' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
  suffix?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, change, changeType = 'neutral', icon, color = 'brand', suffix, className
}) => {
  const iconColors = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    purple: 'bg-ai-50 text-ai-600 dark:bg-ai-900/30 dark:text-ai-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  };

  return (
    <Card className={cn('stat-card', className)} padding>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</span>
            {suffix && <span className="text-sm text-slate-500 dark:text-slate-400">{suffix}</span>}
          </div>
          {change && (
            <p className={cn('text-xs mt-1.5 font-medium flex items-center gap-1',
              changeType === 'increase' ? 'text-emerald-600 dark:text-emerald-400' :
              changeType === 'decrease' ? 'text-red-600 dark:text-red-400' :
              'text-slate-500 dark:text-slate-400'
            )}>
              {changeType === 'increase' && '↑'}
              {changeType === 'decrease' && '↓'}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3', iconColors[color])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => (
  <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
    {icon && (
      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{description}</p>}
    {action && (
      <Button className="mt-4" onClick={action.onClick}>{action.label}</Button>
    )}
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export const Skeleton: React.FC<{ className?: string; lines?: number }> = ({ className, lines = 1 }) => (
  <>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={cn('animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg', i > 0 && 'mt-2', className)} />
    ))}
  </>
);

export const SkeletonCard: React.FC = () => (
  <Card>
    <div className="space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  </Card>
);

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative bg-white dark:bg-slate-800 rounded-2xl shadow-modal w-full border border-slate-200 dark:border-slate-700 animate-slide-up max-h-[90vh] flex flex-col',
        sizeClasses[size]
      )}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

interface Tab { id: string; label: string; icon?: React.ReactNode; badge?: string | number }

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => (
  <div className={cn('flex items-center gap-1 border-b border-slate-200 dark:border-slate-700', className)}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-150 -mb-px',
          activeTab === tab.id
            ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300'
        )}
      >
        {tab.icon}
        {tab.label}
        {tab.badge !== undefined && (
          <Badge variant={activeTab === tab.id ? 'indigo' : 'slate'} className="text-[10px]">
            {tab.badge}
          </Badge>
        )}
      </button>
    ))}
  </div>
);

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [show, setShow] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className={cn('absolute z-50 px-2 py-1 text-xs text-white bg-slate-900 dark:bg-slate-700 rounded-lg whitespace-nowrap pointer-events-none', positionClasses[position])}>
          {content}
        </div>
      )}
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, total, limit, onPageChange }) => {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{start}–{end}</span> of{' '}
        <span className="font-medium text-slate-700 dark:text-slate-300">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                p === page
                  ? 'bg-brand-600 text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              )}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─── Alert ────────────────────────────────────────────────────────────────────

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, children, onClose }) => {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  };

  return (
    <div className={cn('rounded-xl border p-4', styles[type])}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && <p className="font-semibold text-sm mb-1">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmVariant = 'primary', loading
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm"
    footer={
      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant={confirmVariant} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    }
  >
    <div className="text-center py-2">
      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  </Modal>
);

// ─── Timeline ─────────────────────────────────────────────────────────────────

interface TimelineItem {
  label: string;
  date?: string;
  status: 'passed' | 'current' | 'pending' | 'failed';
  description?: string;
}

export const Timeline: React.FC<{ items: TimelineItem[] }> = ({ items }) => (
  <div className="relative">
    {items.map((item, i) => (
      <div key={i} className="flex gap-4 pb-6 last:pb-0">
        <div className="flex flex-col items-center">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors',
            item.status === 'passed' ? 'bg-emerald-500 border-emerald-500 text-white' :
            item.status === 'current' ? 'bg-brand-600 border-brand-600 text-white' :
            item.status === 'failed' ? 'bg-red-500 border-red-500 text-white' :
            'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
          )}>
            {item.status === 'passed' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {item.status === 'current' && <div className="w-2 h-2 rounded-full bg-white" />}
            {item.status === 'failed' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {item.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
          </div>
          {i < items.length - 1 && (
            <div className={cn(
              'w-0.5 flex-1 mt-1',
              item.status === 'passed' ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-slate-200 dark:bg-slate-700'
            )} />
          )}
        </div>
        <div className="flex-1 pt-1 pb-2">
          <div className="flex items-center justify-between">
            <p className={cn(
              'text-sm font-medium',
              item.status === 'current' ? 'text-brand-700 dark:text-brand-400' :
              item.status === 'passed' ? 'text-slate-900 dark:text-slate-100' :
              'text-slate-400 dark:text-slate-500'
            )}>
              {item.label}
            </p>
            {item.date && <span className="text-xs text-slate-400 dark:text-slate-500">{item.date}</span>}
          </div>
          {item.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>}
        </div>
      </div>
    ))}
  </div>
);

// ─── AI Badge ─────────────────────────────────────────────────────────────────

export const AIBadge: React.FC<{ label?: string; className?: string }> = ({ label = 'AI Powered', className }) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
    'bg-gradient-to-r from-ai-100 to-brand-100 text-ai-700 dark:from-ai-900/50 dark:to-brand-900/50 dark:text-ai-300',
    className
  )}>
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
    </svg>
    {label}
  </span>
);

// ─── Stepper ──────────────────────────────────────────────────────────────────

interface Step { id: string; title: string; description?: string }

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, className }) => (
  <div className={cn('flex items-center', className)}>
    {steps.map((step, i) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
            i < currentStep ? 'bg-brand-600 border-brand-600 text-white' :
            i === currentStep ? 'border-brand-600 text-brand-600 dark:text-brand-400' :
            'border-slate-300 dark:border-slate-600 text-slate-400'
          )}>
            {i < currentStep ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : i + 1}
          </div>
          <p className={cn(
            'text-xs font-medium mt-1.5 text-center max-w-[80px]',
            i === currentStep ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
          )}>
            {step.title}
          </p>
        </div>
        {i < steps.length - 1 && (
          <div className={cn('flex-1 h-0.5 mx-2 mb-5', i < currentStep ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700')} />
        )}
      </React.Fragment>
    ))}
  </div>
);
