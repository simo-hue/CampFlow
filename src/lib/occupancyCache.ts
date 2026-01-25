

const CACHE_KEY_PREFIX = 'occupancy_cache_v4_';
const CACHE_VERSION_KEY = 'occupancy_cache_version';
export const CACHE_WINDOW_DAYS = 45;

export function getCacheVersion(): string {
    if (typeof window === 'undefined') return '0';
    return localStorage.getItem(CACHE_VERSION_KEY) || '0';
}

export function invalidateOccupancyCache() {
    if (typeof window === 'undefined') return;
    const newVersion = (parseInt(getCacheVersion()) + 1).toString();
    localStorage.setItem(CACHE_VERSION_KEY, newVersion);
    console.log('🗑️ Occupancy cache invalidated - version:', newVersion);
}

export function getCachedData(key: string): any | null {
    if (typeof window === 'undefined') return null;
    try {
        const item = localStorage.getItem(CACHE_KEY_PREFIX + key);
        if (!item) return null;

        const parsed = JSON.parse(item);
        if (parsed.version !== getCacheVersion()) {
            localStorage.removeItem(CACHE_KEY_PREFIX + key);
            return null;
        }

        console.log('📦 Cache HIT:', key);
        return parsed.data;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

export function setCachedData(key: string, data: any) {
    if (typeof window === 'undefined') return;
    try {
        const cacheObject = {
            version: getCacheVersion(),
            timestamp: Date.now(),
            data,
        };
        localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheObject));
    } catch (error) {
        console.error('Error writing cache:', error);
    }
}
