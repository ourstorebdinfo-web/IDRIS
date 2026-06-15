'use client'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import { useSiteSettings } from '@/lib/context/SiteSettingsContext'

const HeroSkeleton = () => (
    <div className='mx-6'>
        <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10 animate-pulse'>
            {/* Main banner skeleton */}
            <div className='relative flex-1 rounded-3xl xl:min-h-100 bg-slate-100' />
            {/* Side banners skeleton */}
            <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm'>
                <div className='flex-1 rounded-3xl bg-slate-100 min-h-[140px]' />
                <div className='flex-1 rounded-3xl bg-slate-100 min-h-[140px]' />
            </div>
        </div>
        <CategoriesMarquee />
    </div>
)

const Hero = () => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const { settings, isLoading } = useSiteSettings()

    if (isLoading) return <HeroSkeleton />

    const heroBanner = settings?.heroBanner || {}

    const mainBanner = heroBanner.mainBanner || {}
    const topRightBanner = heroBanner.topRightBanner || {}
    const bottomRightBanner = heroBanner.bottomRightBanner || {}

    const mainImg = mainBanner.image || null
    const mainImgProps = mainImg ? { width: 400, height: 400 } : {}

    const topProductImg = topRightBanner.image || null
    const topProductImgProps = topProductImg ? { width: 140, height: 140 } : {}

    const bottomProductImg = bottomRightBanner.image || null
    const bottomProductImgProps = bottomProductImg ? { width: 140, height: 140 } : {}

    return (
        <div className='mx-3 sm:mx-6'>
            <div className='flex max-xl:flex-col gap-4 sm:gap-8 max-w-7xl mx-auto my-4 sm:my-10'>
                <div 
                    style={mainBanner.bgColor ? { backgroundColor: mainBanner.bgColor } : {}}
                    className={`relative flex-1 flex flex-col rounded-3xl xl:min-h-100 group overflow-hidden ${!mainBanner.bgColor ? 'bg-green-200' : ''}`}
                >
                    <div className='py-4 px-5 sm:p-16'>
                        <div className='inline-flex items-center gap-3 bg-green-300 text-green-600 pr-4 p-1 rounded-full text-xs sm:text-sm max-w-full'>
                            <span className='bg-green-600 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs'>
                                {mainBanner.badgeText || 'NEWS'}
                            </span> 
                            {mainBanner.badgeSideText || 'Free Shipping on Orders Above ৳৫০০!'} 
                            <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
                        </div>
                        <h1 className='text-2xl sm:text-5xl leading-[1.2] my-2 font-medium bg-gradient-to-r from-slate-600 to-[#A0FF74] bg-clip-text text-transparent max-w-[60%] sm:max-w-md'>
                            {(mainBanner.largeHeadline || "Gadgets you'll love.") + " " + (mainBanner.smallHeadline || "Prices you'll trust.")}
                        </h1>
                        <div className='text-slate-800 text-sm font-medium mt-3 sm:mt-8'>
                            {mainBanner.startsFromToggle && <p className='text-xs sm:text-sm'>Starts from</p>}
                            <p className='text-2xl sm:text-3xl'>
                                {(() => {
                                    const p = mainBanner.price || '490';
                                    return p.startsWith('৳') || p.startsWith('$') ? p : `${currency}${p}`;
                                })()}
                            </p>
                        </div>
                        <Link href={mainBanner.buttonLink || '/'}>
                            <button className='bg-slate-800 text-white text-sm py-2 px-6 sm:py-5 sm:px-12 mt-3 sm:mt-10 rounded-full sm:rounded-md hover:bg-slate-900 hover:scale-103 active:scale-95 transition'>
                                {mainBanner.buttonText || 'LEARN MORE'}
                            </button>
                        </Link>
                    </div>
                    {mainImg && <Image className='absolute bottom-0 right-4 sm:right-0 md:right-10 w-[45%] max-w-[180px] sm:w-full sm:max-w-sm pointer-events-none' src={mainImg} alt={mainBanner.largeHeadline || 'Featured gadgets from Our Store BD'} {...mainImgProps} />}
                </div>
                <div className='flex flex-row xl:flex-col gap-3 sm:gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                {(() => {
                    const topLink = topRightBanner.link || '/'
                    const Tag = topLink.includes('#') ? 'a' : Link
                    return (
                    <Tag
                        href={topLink}
                        style={topRightBanner.bgColor ? { backgroundColor: topRightBanner.bgColor } : {}}
                        className={`flex-1 flex items-center justify-between w-full rounded-3xl p-3 sm:p-6 sm:px-8 overflow-hidden group ${!topRightBanner.bgColor ? 'bg-orange-200' : ''}`}
                    >
                        <div>
                            <p className='text-xl sm:text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#FFAD51] bg-clip-text text-transparent max-w-40'>
                                {topRightBanner.title || 'Best products'}
                            </p>
                            <p className='flex items-center gap-1 mt-2 text-xs sm:text-sm sm:mt-4'>
                                <span className="hidden sm:inline">View more</span>
                                <ArrowRightIcon className='group-hover:ml-2 transition-all size-3.5 sm:size-[18px]' /> 
                            </p>
                        </div>
                        {topProductImg && <Image className='w-14 sm:w-35' src={topProductImg} alt={topRightBanner.title || 'Best selling products'} {...topProductImgProps} />}
                    </Tag>
                    )
                })()}
                {(() => {
                    const bottomLink = bottomRightBanner.link || '/'
                    const Tag = bottomLink.includes('#') ? 'a' : Link
                    return (
                    <Tag
                        href={bottomLink}
                        style={bottomRightBanner.bgColor ? { backgroundColor: bottomRightBanner.bgColor } : {}}
                        className={`flex-1 flex items-center justify-between w-full rounded-3xl p-3 sm:p-6 sm:px-8 overflow-hidden group ${!bottomRightBanner.bgColor ? 'bg-blue-200' : ''}`}
                    >
                        <div>
                            <p className='text-xl sm:text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#78B2FF] bg-clip-text text-transparent max-w-40'>
                                {bottomRightBanner.title || '20% discounts'}
                            </p>
                            <p className='flex items-center gap-1 mt-2 text-xs sm:text-sm sm:mt-4'>
                                <span className="hidden sm:inline">View more</span>
                                <ArrowRightIcon className='group-hover:ml-2 transition-all size-3.5 sm:size-[18px]' /> 
                            </p>
                        </div>
                        {bottomProductImg && <Image className='w-14 sm:w-35' src={bottomProductImg} alt={bottomRightBanner.title || 'Discounted products'} {...bottomProductImgProps} />}
                    </Tag>
                    )
                })()}
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero