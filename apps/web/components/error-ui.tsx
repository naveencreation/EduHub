import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorUIProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

/**
 * Reusable error UI component for displaying error states
 */
export function ErrorUI({
  title = 'Error',
  message,
  onRetry,
  variant = 'error',
}: ErrorUIProps) {
  const variantStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      message: 'text-red-700',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200',
      icon: 'text-amber-600',
      title: 'text-amber-900',
      message: 'text-amber-700',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.container} border rounded-lg p-6 max-w-md mx-auto text-center`}>
      <AlertCircle className={`w-10 h-10 ${styles.icon} mx-auto mb-3`} />
      <h3 className={`${styles.title} font-semibold mb-1`}>{title}</h3>
      <p className={`${styles.message} text-sm mb-4`}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            variant === 'error'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : variant === 'warning'
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * Empty state component
 */
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-slate-300 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-slate-600">{description}</p>}
    </div>
  );
}
