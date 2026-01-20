'use client';

import { useState } from 'react';
import { loginAction } from './actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const result = await loginAction(formData);

        if (result?.error) {
            toast.error(result.error);
            setIsLoading(false);
        }
        // If successful, the action redirects, so no need to set loading false manually
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
            <div className="w-full max-w-sm p-6 bg-gray-900 rounded-lg border border-gray-800 shadow-xl">
                <h1 className="text-xl font-bold mb-6 text-center text-gray-200">System Monitor Login</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-400">Admin Username</label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-400">Admin Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded flex items-center justify-center transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enter Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
