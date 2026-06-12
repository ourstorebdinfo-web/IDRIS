'use client'
import Link from "next/link"
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { Menu } from "lucide-react"

const AdminNavbar = ({ sidebarOpen, setSidebarOpen }) => {
    const [siteName, setSiteName] = useState('gocart')

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/site-settings')
                const j = await res.json()
                if (res.ok && j.siteSetting) {
                    setSiteName(j.siteSetting.siteName || 'gocart')
                }
            } catch (err) {
                // ignore
            }
        }
        load()
    }, [])

    return (
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-slate-200 shadow-sm transition-all gap-4">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-xl md:hidden transition"
                    title="Toggle Menu"
                >
                    <Menu size={24} />
                </button>
                <Link href="/" className="relative text-3xl sm:text-4xl font-semibold text-slate-700">
                    <span className="text-green-600">{siteName.charAt(0)}</span>{siteName.slice(1)}<span className="text-green-600 text-5xl leading-0">.</span>
                    <p className="absolute text-[10px] sm:text-xs font-semibold -top-1 -right-11 sm:-right-13 px-2 sm:px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                        Admin
                    </p>
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-slate-600 text-sm font-medium hidden sm:block">Hi, Admin</p>
                <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-full transition-all duration-150"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default AdminNavbar