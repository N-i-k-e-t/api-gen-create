import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4 text-center">
      <div className="max-w-xl space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Excel to API
        </h1>
        <p className="text-xl text-zinc-400">
          Turn your spreadsheets into a secure, programmable API in seconds.
          Simple, fast, and developer-friendly.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
          >
            Access Portal
          </Link>
          <Link
            href="/api/data"
            className="px-8 py-3 border border-zinc-700 text-zinc-300 font-semibold rounded-full hover:bg-zinc-900 transition-colors"
          >
            Read API Docs
          </Link>
        </div>
      </div>
    </div>
  );
}
