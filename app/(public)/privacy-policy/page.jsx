import Link from 'next/link'

export const metadata = {
    title: 'Privacy Policy | GoCart',
    description: 'Learn how GoCart collects, uses, and protects your personal data when using our website and services.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-10 shadow-sm">
          <div className="mb-10">
            <p className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Privacy Policy</p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">Your privacy is important to us.</h1>
            <p className="mt-4 max-w-3xl text-slate-600 leading-8">This page explains what information we collect, why we collect it, and how we protect your personal data while you shop with GoCart.</p>
          </div>

          <div className="space-y-10 text-slate-700">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Information we collect</h2>
              <p className="leading-7">We collect only the information needed to process your order, manage your account, and provide support. This may include your name, email, shipping address, and payment details when you place an order.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">How we use your information</h2>
              <p className="leading-7">Your information is used to fulfill orders, send updates, and keep your shopping experience smooth. We do not sell your personal data to third parties.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Cookies and tracking</h2>
              <p className="leading-7">We use cookies to remember your cart and improve site performance. Cookies help us keep your browsing experience fast and secure.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Data security</h2>
              <p className="leading-7">We protect your data with standard security measures and only share it when necessary to complete your order, such as with shipping providers or payment processors.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Contact us</h2>
              <p className="leading-7">If you have questions about privacy, please <Link href="/contact" className="text-emerald-600 hover:underline">contact us</Link>. We’re happy to help.</p>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
