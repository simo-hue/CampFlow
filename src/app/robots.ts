import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    // campflow.app is a parked domain we do not own. The public site is on GitHub Pages.
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '')
        ?? 'https://simo-hue.github.io/CampFlow';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard/'], // Protect internal routes if any
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
