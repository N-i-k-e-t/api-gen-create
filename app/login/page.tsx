'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push('/dashboard');
                router.refresh(); // Refresh middleware/server state
            } else {
                const data = await res.json();
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950" />

            <div className="w-full max-w-sm p-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-400">
                        <Lock className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1.5 font-semibold">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-zinc-700"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs bg-red-950/30 p-3 rounded border border-red-900/20 text-center">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enter System'}
                    </button>
                </form>
            </div>
        </div>
    );
}
