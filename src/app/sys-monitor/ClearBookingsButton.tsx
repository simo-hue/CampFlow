'use client';

import { useState } from 'react';
import { clearBookingsAction } from './login/actions';

export default function ClearBookingsButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClear = async () => {
        console.log('Handle Clear Triggered', confirmText);
        if (confirmText !== 'CLEAR') return;
        setIsLoading(true);
        setError(null);

        try {
            console.log('Calling server action clearBookingsAction...');
            const result = await clearBookingsAction();
            console.log('Server action result:', result);
            if (result.success) {
                setIsOpen(false);
                window.location.reload();
            } else {
                setError(result.error || 'Clear failed');
            }
        } catch (err: any) {
            console.error('Client error calling action:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 hover:text-yellow-400 border border-yellow-500/50 px-4 py-2 rounded text-xs font-bold transition-all uppercase tracking-wider w-full flex items-center justify-center gap-2 group"
            >
                <div className="w-2 h-2 bg-yellow-500 rounded-full group-hover:animate-pulse" />
                [ CLEAR BOOKINGS ]
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-yellow-500/50 rounded-lg max-w-md w-full p-6 shadow-[0_0_50px_rgba(234,179,8,0.2)] relative animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <h3 className="text-yellow-500 text-lg font-bold mb-4 flex items-center gap-2 border-b border-yellow-900/30 pb-2">
                            <span className="text-2xl">⚠️</span> CLEAR BOOKINGS
                        </h3>

                        {/* Warning */}
                        <div className="space-y-4 mb-6">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                You are about to delete <span className="text-yellow-400 font-bold">ALL BOOKINGS</span>.
                            </p>
                            <ul className="text-xs text-gray-400 list-disc pl-5 space-y-1">
                                <li>Delete <strong className="text-gray-300">ALL Bookings</strong></li>
                                <li>Delete <strong className="text-gray-300">ALL Guests</strong></li>
                                <li><strong className="text-green-400">Pitches & Seasons will remain untouched</strong></li>
                            </ul>
                            <div className="bg-yellow-950/30 border border-yellow-900/50 p-3 rounded text-yellow-200 text-xs font-bold text-center">
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
                            <label className="block text-gray-500 text-[10px] mb-2 uppercase tracking-widest font-bold">Type "CLEAR" to confirm</label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white font-mono placeholder-gray-800 focus:border-yellow-500 focus:outline-none transition-colors text-center uppercase tracking-widest"
                                placeholder="CLEAR"
                                autoFocus
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-2 gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 rounded text-gray-500 hover:text-white hover:bg-gray-800 transition-colors text-xs font-medium"
                                disabled={isLoading}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleClear}
                                disabled={confirmText !== 'CLEAR' || isLoading}
                                className="flex-1 px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-900/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        CLEARING...
                                    </>
                                ) : (
                                    'CONFIRM CLEAR'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
