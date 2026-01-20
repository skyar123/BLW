import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-sage-400 text-white hover:bg-sage-500 focus:ring-sage-400',
      secondary: 'bg-sage-100 dark:bg-sage-900 text-sage-700 dark:text-sage-300 hover:bg-sage-200 dark:hover:bg-sage-800 focus:ring-sage-300',
      ghost: 'bg-transparent text-charcoal dark:text-gray-200 hover:bg-sage-50 dark:hover:bg-gray-700 focus:ring-sage-300',
      danger: 'bg-coral-400 text-white hover:bg-coral-500 focus:ring-coral-400',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
