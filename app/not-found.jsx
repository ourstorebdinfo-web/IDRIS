import Link from 'next/link'

export const metadata = {
    title: 'Page Not Found | GoCart',
    description: 'The page you are looking for does not exist or has been moved.',
}

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="text-center p-8 max-w-md">
                <p className="text-7xl font-bold text-slate-200 mb-4">404</p>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                    পেজটি পাওয়া যায়নি
                </h2>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                    আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়েছে বা আর নেই।
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-block bg-slate-800 text-white px-8 py-3 rounded-lg hover:bg-slate-900 active:scale-95 transition-all text-sm font-medium"
                    >
                        হোম পেজে যান
                    </Link>
                    <Link
                        href="/shop"
                        className="inline-block border border-slate-300 text-slate-700 px-8 py-3 rounded-lg hover:bg-slate-50 active:scale-95 transition-all text-sm font-medium"
                    >
                        শপ দেখুন
                    </Link>
                </div>
            </div>
        </div>
    )
}
