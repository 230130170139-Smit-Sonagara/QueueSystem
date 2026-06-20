import { cn } from '@/lib/cn.js'

const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
    ghost:   'text-primary-600 hover:bg-primary-50',
    danger:  'bg-danger-500 hover:bg-danger-600 text-white',
}

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
}

export function Button({
                           variant = 'primary',
                           size = 'md',
                           className,
                           disabled,
                           children,
                           ...props
                       }) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
}