import { MetadataRoute } from 'next';

// The public site is served from GitHub Pages under /CampFlow. Keep this in step
// with `basePath` in next.config.ts and `metadataBase` in layout.tsx.
//
// campflow.app is a parked domain we do not own — never point anything here at it.
const BASE_URL = 'https://simo-hue.github.io/CampFlow';

// Required: next.config.ts sets `output: "export"`, and route handlers must opt
// into static generation explicitly or the build fails collecting page data.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    // Deliberately no `lastModified`: stamping every URL with the build time makes
    // the whole site look freshly changed on every deploy, which crawlers discount.
    return [
        // Trailing slash so this matches the rel=canonical exactly; a sitemap entry
        // that differs from the canonical by a slash is a second URL for one page.
        { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
        { url: `${BASE_URL}/features`, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/pricing`, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/faq`, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
        { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    ];
}
