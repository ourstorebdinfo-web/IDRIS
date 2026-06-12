'use client'
import { SessionProvider } from 'next-auth/react'
import StoreProvider from './StoreProvider'
import { Toaster } from 'react-hot-toast'
import { SiteSettingsProvider } from '@/lib/context/SiteSettingsContext'

export default function Providers({ children, initialSettings }) {
  return (
    <SiteSettingsProvider initialSettings={initialSettings}>
      <SessionProvider>
        <StoreProvider>
          <Toaster />
          {children}
        </StoreProvider>
      </SessionProvider>
    </SiteSettingsProvider>
  )
}
