import React from 'react'
import { Star, Quote } from 'lucide-react'

const testimonials = [
    {
        name: 'Tanvir Rahman',
        location: 'Dhaka',
        initials: 'TR',
        gradient: 'from-emerald-400 to-teal-500',
        rating: 5,
        review: 'সারা বাংলাদেশে দ্রুত ডেলিভারি আর আসল প্রোডাক্টের গ্যারান্টি! অর্ডার করার পরদিনই ঢাকাতে হোম ডেলিভারি পেয়েছি। সার্ভিস সত্যি চমৎকার!',
        date: '২ দিন আগে'
    },
    {
        name: 'Nafisa Anjum',
        location: 'Chittagong',
        initials: 'NA',
        gradient: 'from-blue-400 to-indigo-500',
        rating: 5,
        review: 'GoCart is my absolute favorite store for tech accessories. Their customer support is top-notch, and the packaging was extremely secure. Highly recommended!',
        date: '১ সপ্তাহ আগে'
    },
    {
        name: 'Adib Hasan',
        location: 'Sylhet',
        initials: 'AH',
        gradient: 'from-purple-400 to-pink-500',
        rating: 5,
        review: 'প্রোডাক্টের কোয়ালিটি নিয়ে কোনো সন্দেহ নেই। ১ মাসের ওয়ারেন্টি সহ আসল ইয়ারবাডস পেয়েছি। বিন্দুমাত্র হতাশ হতে হয়নি!',
        date: '২ সপ্তাহ আগে'
    }
]

const Reviews = () => {
    return (
        <section className="mx-6 my-28">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-16">
                    <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-emerald-100 mb-4">
                        Testimonials
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
                        Customer Reviews
                    </h2>
                    <p className="max-w-xl text-slate-500 mt-3 text-sm sm:text-base leading-relaxed">
                        See why thousands of gadget lovers in Bangladesh trust GoCart for original products and reliable service.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="overflow-hidden w-full relative py-4">
                    <div className="flex animate-scroll w-max">
                        {[...testimonials, ...testimonials].map((t, idx) => (
                            <div 
                                key={idx}
                                className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-4 shadow-sm group w-[300px] sm:w-[350px] h-44 flex flex-col justify-between flex-shrink-0 mr-8 testimonial-card"
                            >
                                {/* Quote Decoration */}
                                <Quote 
                                    size={56} 
                                    className="absolute right-6 top-6 text-slate-100/70 group-hover:text-emerald-50/70 transition-colors duration-300 pointer-events-none" 
                                />

                                <div>
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-2">
                                        {Array.from({ length: t.rating }).map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={18} 
                                                className="text-green-400 fill-current group-hover:scale-110 transition-transform duration-300" 
                                            />
                                        ))}
                                    </div>

                                    {/* Review Content */}
                                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic relative z-10 line-clamp-3">
                                        &ldquo;{t.review}&rdquo;
                                    </p>
                                </div>

                                {/* Reviewer Details */}
                                <div className="flex items-center gap-3 border-t border-slate-100 pt-2.5">
                                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0`}>
                                        {t.initials}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800 text-xs sm:text-sm">
                                            {t.name}
                                        </h4>
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                            <span>{t.location}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>{t.date}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Reviews
