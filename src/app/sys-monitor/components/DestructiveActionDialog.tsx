'use client';

import { useState } from 'react';

type Theme = 'red' | 'yellow' | 'blue' | 'orange' | 'green' | 'gray';

interface DestructiveActionDialogProps {
    trigger: React.ReactNode;
    title: string;
    description: React.ReactNode;
    confirmKeyword: string;
    actionFn: () => Promise<{ success: boolean; message?: string; error?: string }>;
    theme?: Theme;
}

const THEMES = {
    red: {
        bg: 'bg-red-500',
        text: 'text-red-500',
        border: 'border-red-500',
        hoverBg: 'hover:bg-red-500/20',
        lightBg: 'bg-red-950',
        shadow: 'shadow-red-900/20',
    },
    yellow: {
        bg: 'bg-yellow-500',
        text: 'text-yellow-500',
        border: 'border-yellow-500',
        hoverBg: 'hover:bg-yellow-500/20',
        lightBg: 'bg-yellow-950',
        shadow: 'shadow-yellow-900/20',
    },
    blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-500',
        border: 'border-blue-500',
        hoverBg: 'hover:bg-blue-500/20',
        lightBg: 'bg-blue-950',
        shadow: 'shadow-blue-900/20',
    },
    orange: {
        bg: 'bg-orange-500',
        text: 'text-orange-500',
        border: 'border-orange-500',
        hoverBg: 'hover:bg-orange-500/20',
        lightBg: 'bg-orange-950',
        shadow: 'shadow-orange-900/20',
    },
    green: {
        bg: 'bg-green-500',
        text: 'text-green-500',
        border: 'border-green-500',
        hoverBg: 'hover:bg-green-500/20',
        lightBg: 'bg-green-950',
        shadow: 'shadow-green-900/20',
    },
    gray: {
        bg: 'bg-gray-500',
        text: 'text-gray-500',
        border: 'border-gray-500',
        hoverBg: 'hover:bg-gray-500/20',
        lightBg: 'bg-gray-950',
        shadow: 'shadow-gray-900/20',
    },
};

export default function DestructiveActionDialog({
    trigger,
    title,
    description,
    confirmKeyword,
    actionFn,
    theme = 'red'
}: DestructiveActionDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const t = THEMES[theme];

    const handleAction = async () => {
        if (confirmText !== confirmKeyword) return;
        setIsLoading(true);
        setError(null);

        try {
            const result = await actionFn();
            if (result.success) {
                setIsOpen(false);
                window.location.reload();
            } else {
                setError(result.error || 'Action failed');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="cursor-pointer w-full">
                {trigger}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className={`bg-gray-950 border ${t.border}/30 rounded-lg max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200`}>
                        {/* Header */}
                        <h3 className={`${t.text} text-lg font-bold mb-4 flex items-center gap-2 border-b ${t.border}/20 pb-2`}>
                            <span className="text-xl">⚠️</span> {title}
                        </h3>

                        {/* Description */}
                        <div className="space-y-4 mb-6">
                            <div className="text-gray-300 text-sm leading-relaxed">
                                {description}
                            </div>

                            <div className={`${t.lightBg}/40 border ${t.border}/30 p-3 rounded ${t.text} text-xs font-bold text-center`}>
                                THIS ACTION CANNOT BE UNDONE
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-950/80 border border-red-500/50 text-red-200 p-3 rounded mb-4 text-xs font-mono break-all">
                                Error: {error}
                            </div>
                        )}

                        {/* Input Confirmation */}
                        <div className="mb-6">
                            <label className="block text-gray-500 text-[10px] mb-2 uppercase tracking-widest font-bold">
                                Type <span className={t.text}>"{confirmKeyword}"</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className={`w-full bg-black/50 border border-gray-800 rounded p-2 text-white font-mono placeholder-gray-800 focus:${t.border} focus:outline-none transition-colors text-center uppercase tracking-widest`}
                                placeholder={confirmKeyword}
                                autoFocus
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-2 gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 rounded text-gray-500 hover:text-white hover:bg-gray-900 transition-colors text-xs font-medium"
                                disabled={isLoading}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={confirmText !== confirmKeyword || isLoading}
                                className={`flex-1 px-4 py-2 rounded ${t.bg} hover:opacity-90 text-white font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all ${t.shadow} active:scale-95 flex items-center justify-center gap-2`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        PROCESSING...
                                    </>
                                ) : (
                                    'CONFIRM ACTION'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
