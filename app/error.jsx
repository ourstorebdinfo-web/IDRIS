'use client'

export default function Error({ error, reset }) {
    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="text-center p-8 max-w-md">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                    কিছু একটা ভুল হয়েছে
                </h2>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                    পেজটি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।
                </p>
                <button
                    onClick={() => reset()}
                    className="bg-slate-800 text-white px-8 py-3 rounded-lg hover:bg-slate-900 active:scale-95 transition-all text-sm font-medium"
                >
                    আবার চেষ্টা করুন
                </button>
            </div>
        </div>
    )
}
