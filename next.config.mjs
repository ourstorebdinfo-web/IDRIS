/** @type {import('next').NextConfig} */
const nextConfig = {
    // ── Fix #2: Enable image optimization (WebP/AVIF auto-conversion) ──
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'i.ibb.co' },
            { protocol: 'https', hostname: 'i.ibb.co.com' },
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
    },

    // ── Fix #4: Security headers ──
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "img-src 'self' data: blob: https://i.ibb.co https://i.ibb.co.com https://www.google-analytics.com https://www.googletagmanager.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "connect-src 'self' https://connect.facebook.net https://www.google-analytics.com https://api.imgbb.com",
                            "frame-src https://www.googletagmanager.com",
                        ].join('; '),
                    },
                ],
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
        ];
    },
};

export default nextConfig;
