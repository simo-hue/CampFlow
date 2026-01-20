import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://campflow.app'; // Replace with actual domain

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard/'], // Protect internal routes if any
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
