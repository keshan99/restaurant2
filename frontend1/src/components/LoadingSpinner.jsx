/**
 * Reusable loading animation.
 * Use size="sm" | "md" | "lg", fullScreen for overlay, inline for inside buttons.
 */
export default function LoadingSpinner({ size = 'md', fullScreen = false, inline = false, label }) {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-10 h-10 border-2',
        lg: 'w-14 h-14 border-[3px]'
    };

    const spinner = (
        <div
            className={`${sizeClasses[size]} border-current border-t-transparent rounded-full animate-spin flex-shrink-0`}
            role="status"
            aria-label="Loading"
        />
    );

    const content = inline ? (
        spinner
    ) : (
        <div className="flex flex-col items-center justify-center gap-3">
            {spinner}
            {label && (
                <span className="text-sm text-gray-500 font-medium">{label}</span>
            )}
        </div>
    );

    if (inline) return spinner;
    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-50/90 dark:bg-zinc-900/90">
                {content}
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center p-8">
            {content}
        </div>
    );
}
