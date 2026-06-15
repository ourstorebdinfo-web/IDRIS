"use client"
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSession, signOut } from 'next-auth/react'
import { useSiteSettings } from "@/lib/context/SiteSettingsContext";

const Navbar = () => {

    const router = useRouter();
    const pathname = usePathname();
    const { settings, isLoading } = useSiteSettings();

    const [search, setSearch] = useState('')
    const [mobileOpen, setMobileOpen] = useState(false)
    const [showMobileSearch, setShowMobileSearch] = useState(false)
    const cartCount = useSelector(state => state.cart.total)
    const { data: session } = useSession()

    const handleSearch = (e) => {
        e.preventDefault()
        setMobileOpen(false)
        setShowMobileSearch(false)
        router.push(`/shop?search=${search}`)
    }

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
        setShowMobileSearch(false)
    }, [pathname])

    if (isLoading) {
        return <div className="h-[73px] bg-white border-b border-gray-350 w-full" />
    }

    const navLinks = settings?.headerNav || null
    const logoImage = settings?.logoImage || ''
    const siteName = settings?.siteName || 'gocart'
    const showLogo = settings?.showLogo !== undefined ? settings.showLogo : true

    const links = (navLinks && navLinks.length > 0) ? navLinks : [
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/shop' },
        { name: 'Categories', url: '/categories' },
        { name: 'About', url: '/about' },
        { name: 'Contact', url: '/contact' },
    ]

    return (
        <nav className="relative bg-white z-40">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative flex items-center gap-3 text-slate-700">
                    {(showLogo && logoImage) ? (
                            <Image src={logoImage} alt="Site logo" width={120} height={40} className="h-10 w-auto rounded-2xl object-contain" />
                        ) : (
                            <span className="text-4xl font-semibold">
                                <span className="text-green-600">{siteName.charAt(0)}</span>{siteName.slice(1)}<span className="text-green-600 text-5xl leading-0">.</span>
                            </span>
                        )}
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-2 lg:gap-4 text-slate-600">
                        {links.map((l, i) => {
                            const isLinkActive = l.url === '/' ? pathname === '/' : pathname?.startsWith(l.url)
                            return (
                                <Link
                                    key={i}
                                    href={l.url || '/'}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                        isLinkActive
                                            ? 'bg-slate-200/50 border border-slate-300/30 text-slate-900 shadow-sm backdrop-blur-md'
                                            : 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                                    }`}
                                >
                                    {l.name || l.text}
                                </Link>
                            )
                        })}

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input
                                className="w-full bg-transparent outline-none placeholder-slate-600"
                                type="text"
                                placeholder="Search products"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                required
                            />
                        </form>

                        <button
                            type="button"
                            onClick={() => setShowMobileSearch(prev => !prev)}
                            className="xl:hidden flex items-center justify-center p-2 text-slate-600 hover:bg-slate-100 rounded-full transition"
                            aria-label="Search"
                        >
                            <Search size={18} />
                        </button>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">{cartCount}</span>
                        </Link>

                        {session?.user ? (
                            <div className="flex items-center gap-3">
                                {session.user.image
                                    ? <Image src={session.user.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                                    : <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">{(session.user.name || session.user.email || '?')[0].toUpperCase()}</div>
                                }
                                <span className="text-sm">{session.user.name || session.user.email}</span>
                                <button
                                    onClick={() => signOut()}
                                    className="px-3 py-1 bg-slate-200 rounded text-sm hover:bg-slate-300 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : null}
                    </div>

                    {/* Mobile Right Side */}
                    <div className="sm:hidden flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowMobileSearch(prev => !prev)}
                            className="p-1 text-slate-600 hover:text-slate-900 transition"
                            aria-label="Search"
                        >
                            <Search size={20} />
                        </button>
                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={20} />
                            <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full flex items-center justify-center">{cartCount}</span>
                        </Link>
                        <button
                            onClick={() => setMobileOpen(prev => !prev)}
                            className="p-1 text-slate-600 hover:text-slate-900 transition"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />

            {/* Slide-down search bar for viewports smaller than xl */}
            {showMobileSearch && (
                <div className="xl:hidden bg-slate-50 border-b border-gray-200 px-6 py-3 transition-all animate-fadeIn">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-full text-sm shadow-sm max-w-xl mx-auto">
                        <Search size={16} className="text-slate-500" />
                        <input
                            className="w-full bg-transparent outline-none placeholder-slate-400 text-slate-700 font-medium"
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            required
                            autoFocus
                        />
                        <button type="button" onClick={() => setShowMobileSearch(false)} className="text-slate-400 hover:text-slate-600 ml-1">
                            <X size={16} />
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="sm:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg z-50 px-6 py-4 flex flex-col gap-3">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-100 px-4 py-2.5 rounded-full text-sm">
                        <Search size={16} className="text-slate-500" />
                        <input
                            className="w-full bg-transparent outline-none placeholder-slate-500 text-slate-700"
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            required
                        />
                    </form>

                    {/* Mobile Nav Links */}
                    <div className="flex flex-col gap-1">
                        {links.map((l, i) => {
                            const isLinkActive = l.url === '/' ? pathname === '/' : pathname?.startsWith(l.url)
                            return (
                                <Link
                                    key={i}
                                    href={l.url || '/'}
                                    onClick={() => setMobileOpen(false)}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                        isLinkActive
                                            ? 'bg-slate-100 text-slate-900 font-semibold'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    {l.name || l.text}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Mobile Session Controls */}
                    {session?.user ? (
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                            {session.user.image
                                ? <Image src={session.user.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                                : <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">{(session.user.name || session.user.email || '?')[0].toUpperCase()}</div>
                            }
                            <span className="text-sm flex-1 truncate">{session.user.name || session.user.email}</span>
                            <button
                                onClick={() => { signOut(); setMobileOpen(false) }}
                                className="px-3 py-1 bg-slate-200 rounded text-sm hover:bg-slate-300 transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : null}
                </div>
            )}
        </nav>
    )
}

export default Navbar