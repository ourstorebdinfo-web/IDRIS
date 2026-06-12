'use client'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Title = ({ title, description, visibleButton = true, href = '' }) => {
    const Content = () => (
        <>
            <p className='max-w-lg text-center leading-relaxed font-medium'>{description}</p>
            {visibleButton && (
                <span className='text-emerald-600 font-semibold flex items-center gap-1 shrink-0 bg-emerald-50/50 hover:bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/60 transition-all duration-200'>
                    View more <ArrowRight size={14} />
                </span>
            )}
        </>
    )

    return (
        <div className='flex flex-col items-center text-center'>
            <h2 className='text-xl sm:text-2xl font-bold text-slate-800 px-6 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm inline-flex items-center justify-center hover:border-slate-300/60 transition-all duration-300 select-none'>
                {title}
            </h2>
            {href ? (
                <Link href={href} className='flex flex-row flex-wrap items-center justify-center gap-3 text-sm text-slate-600 mt-4 hover:text-slate-800 transition-colors'>
                    <Content />
                </Link>
            ) : (
                <div className='flex flex-row flex-wrap items-center justify-center gap-3 text-sm text-slate-600 mt-4'>
                    <Content />
                </div>
            )}
        </div>
    )
}

export default Title