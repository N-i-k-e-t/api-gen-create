'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, RefreshCw, Key, Database, FileSpreadsheet, Lock, CheckCircle, AlertCircle, LogOut, Copy } from 'lucide-react';

interface DashboardUIProps {
    currentKeyPrefix: string | undefined | null;
}

export default function DashboardUI({ currentKeyPrefix }: DashboardUIProps) {
    const router = useRouter();

    // API Key State
    const [prefix, setPrefix] = useState(currentKeyPrefix);
    const [newKey, setNewKey] = useState<string | null>(null);
    const [rotating, setRotating] = useState(false);

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    // Data Preview State
    const [dataPreview, setDataPreview] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [apiUrl, setApiUrl] = useState('');

    // Fetch Data Preview on Mount and after Upload
    const refreshData = async () => {
        setLoadingData(true);
        setApiUrl(`${window.location.origin}/api/data`);
        try {
            const res = await fetch('/api/data');
            if (res.ok) {
                const json = await res.json();
                setDataPreview(json);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleRotateKey = async () => {
        if (!confirm('Are you sure? This will invalidate the existing API Key immediately.')) return;

        setRotating(true);
        try {
            const res = await fetch('/api/key/rotate', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setNewKey(data.newKey);
                setPrefix(data.newKey.substring(0, 10) + '...');
            }
        } catch (e) {
            alert('Failed to rotate key');
        } finally {
            setRotating(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(`Success! ${data.count} records processed.`);
                refreshData();
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (e) {
            setMessage('Upload failed.');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    const copyUrl = () => {
        navigator.clipboard.writeText(apiUrl);
        alert('API URL copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
            {/* Navbar */}
            <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Database className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">ExcelAPI</span>
                    </div>
                    <button onClick={logout} className="text-sm font-medium text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">

                {/* Top Grid */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* API Key Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Key className="w-5 h-5 text-amber-500" /> API Access
                            </h2>
                            {prefix && !newKey && <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium sm:block hidden">Active</span>}
                        </div>

                        <div className="space-y-4">
                            {newKey ? (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">New API Key Generated</p>
                                    <p className="font-mono text-sm break-all font-semibold selection:bg-amber-200 selection:text-amber-900">{newKey}</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">Copy this now. You won't see it again.</p>
                                </div>
                            ) : (
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-between">
                                    <div className="font-mono text-sm text-zinc-500">
                                        {prefix ? `${prefix}****************` : 'No API Key Found'}
                                    </div>
                                    <Lock className="w-4 h-4 text-zinc-400" />
                                </div>
                            )}

                            <button
                                onClick={handleRotateKey}
                                disabled={rotating}
                                className="w-full py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <RefreshCw className={`w-4 h-4 ${rotating ? 'animate-spin' : ''}`} />
                                {prefix ? 'Regenerate Key' : 'Generate First Key'}
                            </button>
                        </div>
                    </div>

                    {/* Upload Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> Ingest Data
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <label className={`
                flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                ${uploading ? 'bg-zinc-100 border-zinc-300' : 'border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'}
              `}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {uploading ? (
                                        <RefreshCw className="w-8 h-8 text-zinc-400 animate-spin mb-2" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                                    )}
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {uploading ? 'Processing...' : <span className="font-semibold">Click to upload .xlsx</span>}
                                    </p>
                                </div>
                                <input type="file" className="hidden" accept=".xlsx" onChange={handleUpload} disabled={uploading} />
                            </label>

                            {message && (
                                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.startsWith('Success') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-700'}`}>
                                    {message.startsWith('Success') ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Data Preview */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold">Live Data Preview</h2>
                            <p className="text-sm text-zinc-500">Your API is ready to serve data.</p>
                        </div>

                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 w-full md:w-auto">
                            <code className="text-xs text-zinc-600 dark:text-zinc-400 font-mono flex-1 px-2 truncate max-w-[300px]">
                                {apiUrl || 'Loading URL...'}
                            </code>
                            <button onClick={copyUrl} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors" title="Copy URL">
                                <Copy className="w-4 h-4 text-zinc-500" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-950 p-0 overflow-x-auto">
                        {loadingData ? (
                            <div className="p-8 text-center text-zinc-500 flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" /> Loading data...
                            </div>
                        ) : (
                            <pre className="text-xs md:text-sm text-zinc-300 font-mono p-6">
                                {JSON.stringify(dataPreview, null, 2)}
                            </pre>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
