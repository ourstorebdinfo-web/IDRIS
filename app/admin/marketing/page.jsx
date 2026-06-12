'use client'
import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { clearSiteSettingsCache } from '@/lib/siteSettings'

export default function AdminMarketingPage() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    facebookPixelId: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    seoTitle: '',
    metaDescription: '',
    metaKeywords: '',
    faviconImage: '',
  })
  const [status, setStatus] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/site-settings', { credentials: 'same-origin' })
        const json = await res.json()
        if (res.ok) {
          setSettings({
            facebookPixelId: json.siteSetting.facebookPixelId || '',
            googleAnalyticsId: json.siteSetting.googleAnalyticsId || '',
            googleTagManagerId: json.siteSetting.googleTagManagerId || '',
            seoTitle: json.siteSetting.seoTitle || '',
            metaDescription: json.siteSetting.metaDescription || '',
            metaKeywords: json.siteSetting.metaKeywords || '',
            faviconImage: json.siteSetting.faviconImage || '',
          })
        }
      } catch (err) {
        console.error('Failed to load settings', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ image: reader.result }),
        })
        const json = await res.json()
        if (json.url) {
          setSettings((prev) => ({ ...prev, faviconImage: json.url }))
        }
      } catch (err) {
        console.error('Favicon upload failed', err)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Saving settings...')
    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const json = await res.json()
      if (res.ok) {
        clearSiteSettingsCache()
        setStatus('Marketing settings saved successfully.')
      } else {
        setStatus(json.error || 'Failed to update settings')
      }
    } catch (err) {
      console.error(err)
      setStatus('Failed to update settings')
    }
  }

  if (loading) {
    return <div className="p-6">Loading marketing settings...</div>
  }

  return (
    <div className="text-slate-600 mb-28 p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="text-emerald-500" size={24} />
        <div>
          <h1 className="text-3xl font-semibold">Marketing <span className="text-slate-800">Settings</span></h1>
          <p className="text-sm text-slate-500">Manage tracking IDs and SEO metadata for the public site.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">Marketing Tracking</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Tracking IDs</h2>
              <p className="mt-2 text-sm text-slate-500">Configure analytics and tracking scripts for the whole site.</p>
            </div>
          </div>
          <div className="grid gap-6">
            <label className="block text-sm font-medium text-slate-700">
              Facebook Pixel ID
              <input
                name="facebookPixelId"
                value={settings.facebookPixelId}
                onChange={handleChange}
                placeholder="Your Facebook Pixel ID"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Google Analytics ID
              <input
                name="googleAnalyticsId"
                value={settings.googleAnalyticsId}
                onChange={handleChange}
                placeholder="G-XXXXXXXX"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Google Tag Manager ID
              <input
                name="googleTagManagerId"
                value={settings.googleTagManagerId}
                onChange={handleChange}
                placeholder="GTM-XXXXXXX"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">SEO Settings</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Search engine metadata</h2>
              <p className="mt-2 text-sm text-slate-500">Update the site title, description, and keywords for SEO.</p>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] items-start border-b border-slate-100 pb-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Favicon Image
                  <p className="text-xs text-slate-400 mt-1">Recommended size: 32x32px or 48x48px (ICO, PNG, or SVG)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                  />
                </label>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs font-medium text-slate-500 mb-2">Favicon Preview</p>
                {settings.faviconImage ? (
                  <div className="relative p-3 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center w-16 h-16">
                    <img src={settings.faviconImage} alt="Favicon preview" className="h-10 w-10 object-contain" />
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, faviconImage: '' }))}
                      className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-1 text-xs transition leading-none w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                    No image
                  </div>
                )}
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Site Title
              <input
                name="seoTitle"
                value={settings.seoTitle}
                onChange={handleChange}
                placeholder="Site title for search engines"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Meta Description
              <textarea
                name="metaDescription"
                value={settings.metaDescription}
                onChange={handleChange}
                rows={3}
                placeholder="Description shown in search results"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Meta Keywords
              <input
                name="metaKeywords"
                value={settings.metaKeywords}
                onChange={handleChange}
                placeholder="comma-separated keywords"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              />
            </label>
          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-400">
            Save changes
          </button>
          {status ? <p className="text-sm text-slate-500">{status}</p> : null}
        </div>
      </form>
    </div>
  )
}
