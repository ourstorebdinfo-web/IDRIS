'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

const SiteSettingsContext = createContext({
    settings: null,
    isLoading: true,
    refreshSettings: async () => {},
})

const defaultHeroBanner = {
    mainBanner: {
        badgeText: 'NEWS',
        badgeSideText: 'Free Shipping on Orders Above ৳৫০০!',
        largeHeadline: "Gadgets you'll love.",
        smallHeadline: "Prices you'll trust.",
        startsFromToggle: true,
        price: '490',
        buttonText: 'LEARN MORE',
        buttonLink: '/',
        image: '',
        bgColor: '',
    },
    topRightBanner: {
        title: 'Best products',
        link: '/',
        image: '',
        bgColor: '',
    },
    bottomRightBanner: {
        title: '20% discounts',
        link: '/',
        image: '',
        bgColor: '',
    }
}

const safeJsonParse = (value, fallback = []) => {
    if (Array.isArray(value)) return value
    if (typeof value === 'object' && value !== null) return value
    if (typeof value !== 'string' || !value.trim()) return fallback
    try {
        return JSON.parse(value)
    } catch {
        return fallback
    }
}

const safeJsonParseObject = (value, fallback) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) return value
    if (typeof value !== 'string' || !value.trim()) return fallback
    try {
        return JSON.parse(value)
    } catch {
        return fallback
    }
}

// Normalizer to align server database object with API response format
const normalizeSettings = (raw) => {
    if (!raw) return null
    return {
        ...raw,
        siteName: raw.siteName || 'gocart',
        logoImage: raw.logoImage || '',
        announcement: raw.announcement || '',
        showLogo: raw.showLogo !== undefined ? Boolean(raw.showLogo) : true,
        headerNav: safeJsonParse(raw.headerNav, [
            { name: 'Home', url: '/' },
            { name: 'Shop', url: '/shop' },
            { name: 'Categories', url: '/categories' },
            { name: 'About', url: '/about' },
            { name: 'Contact', url: '/contact' },
        ]),
        footerProducts: safeJsonParse(raw.footerProducts, [
            { text: 'Earphones', url: '/' },
            { text: 'Headphones', url: '/' },
            { text: 'Smartphones', url: '/' },
            { text: 'Laptops', url: '/' },
        ]),
        footerWebsite: safeJsonParse(raw.footerWebsite, [
            { text: 'Home', url: '/' },
            { text: 'Privacy Policy', url: '/privacy-policy' },
        ]),
        socialLinks: safeJsonParse(raw.socialLinks, []),
        heroBanner: safeJsonParseObject(raw.heroBanner, defaultHeroBanner),
        copyrightText: raw.copyrightText || 'Copyright 2025 © gocart All Right Reserved.',
        whatsappNumber: raw.whatsappNumber || '',
    }
}

export const SiteSettingsProvider = ({ children, initialSettings }) => {
    const [settings, setSettings] = useState(() => {
        // 1. Try server initial settings (normalized)
        if (initialSettings) {
            return normalizeSettings(initialSettings)
        }
        // 2. Try client side local storage fallback
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem('site-settings')
                if (cached) {
                    return JSON.parse(cached)
                }
            } catch (e) {
                console.error('Failed to parse cached site-settings', e)
            }
        }
        return null
    })

    const [isLoading, setIsLoading] = useState(!settings)

    const fetchAndSave = React.useCallback(async () => {
        try {
            const res = await fetch('/api/site-settings')
            if (res.ok) {
                const data = await res.json()
                if (data.siteSetting) {
                    const normalized = normalizeSettings(data.siteSetting)
                    setSettings(normalized)
                    setIsLoading(false)
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('site-settings', JSON.stringify(normalized))
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load fresh site settings', err)
            // If we have nothing, stop loading
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        // If we already have initial settings, we can save them to localStorage and do a background refresh
        if (initialSettings) {
            const normalized = normalizeSettings(initialSettings)
            if (typeof window !== 'undefined') {
                localStorage.setItem('site-settings', JSON.stringify(normalized))
            }
        }
        
        // Background SWR fetch
        fetchAndSave()
    }, [initialSettings, fetchAndSave])

    return (
        <SiteSettingsContext.Provider value={{ settings, isLoading, refreshSettings: fetchAndSave }}>
            {children}
        </SiteSettingsContext.Provider>
    )
}

export const useSiteSettings = () => useContext(SiteSettingsContext)
