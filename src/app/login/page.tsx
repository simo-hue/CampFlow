'use client';

import { useState } from 'react';
import { loginAction } from './actions';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        // We catch the error here because server actions that redirect throw an error "NEXT_REDIRECT"
        try {
            const result = await loginAction(formData);
            if (result?.error) {
                toast.error(result.error);
                setIsLoading(false);
            }
        } catch (error) {
            // If it's a redirect error, we let it pass (it means success)
            console.error(error);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <div className="w-full max-w-sm p-8 bg-card rounded-xl border shadow-lg">
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-center">Accedi a CampFlow</h1>
                    <p className="text-sm text-muted-foreground mt-2">Accesso Gestionale Riservato</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome Utente</label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 bg-primary text-primary-foreground font-medium py-2 rounded-md hover:bg-primary/90 flex items-center justify-center transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accedi'}
                    </button>

                    <div className="mt-6 text-center">
                        <a href="/w" className="text-xs text-muted-foreground hover:underline hover:text-primary">
                            Torna al Sito Pubblico &rarr;
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
