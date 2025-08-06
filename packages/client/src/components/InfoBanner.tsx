import { AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InfoBannerProps {
    className?: string;
    title?: string;
    subtitle?: string;
}

export function InfoBanner({ className, title, subtitle }: InfoBannerProps) {

    let infoTitle = title || 'Info';
    let infoDescription = subtitle || 'This is a test info banner.';

    return (
        <div
            className={cn(
                'bg-opacity-10 border rounded-md p-3 mb-4 w-full md:max-w-4xl',
                'flex items-center justify-between w-full mt-4',
                'bg-blue-900/20 border-blue-700 text-blue-100',
                className
            )}
        >
            <div className="flex items-center space-x-3">
                <AlertCircle
                    className={cn(
                        'h-5 w-5 flex-shrink-0',
                        'text-blue-400'
                    )}
                />
                <div>
                    <h4
                        className={cn(
                            'font-medium text-sm',
                            'text-blue-200'
                        )}
                    >
                        {infoTitle}
                    </h4>
                    <p className={cn('text-xs mt-1', 'text-blue-300')}>
                        {infoDescription}
                    </p>
                    <div className="mt-2 flex space-x-4">
                        <a
                            href="https://eliza.how"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                'text-xs flex items-center',
                                'hover:text-blue-200 text-blue-300'
                            )}
                        >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Learn more
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
