import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const APP_DIR = path.join(process.cwd(), 'src/app');
const WEBSITE_DIR = path.join(APP_DIR, 'w');
const TEMP_PREFIX = '___hidden_';

// App folders/files to hide during static build
const ITEMS_TO_HIDE = [
    'api',
    'arrivals',
    'checkin',
    'customers',
    'departures',
    'info',
    'login',
    'occupancy',
    'settings',
    'stats',
    'sys-monitor',
    'icon.tsx',     // Incompatible with static export
    'sitemap.ts',   // Incompatible with static export (sometimes)
    'robots.ts'     // Incompatible with static export (sometimes)
];

// Files to swap
const DASHBOARD_PAGE = path.join(APP_DIR, 'page.tsx');
const DASHBOARD_PAGE_TEMP = path.join(APP_DIR, '___dashboard_page.tsx');
const LANDING_PAGE = path.join(WEBSITE_DIR, 'page.tsx');
const LANDING_PAGE_TEMP = path.join(WEBSITE_DIR, '___landing_page.tsx');

function renameSafe(oldPath, newPath) {
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        return true;
    }
    return false;
}

async function build() {
    console.log('🚀 Preparing CampFlow for Static Website Build...');

    const hiddenItems = [];
    let dashboardSwapped = false;

    try {
        // 1. Hide Dynamic Routes & Files
        for (const item of ITEMS_TO_HIDE) {
            const originalPath = path.join(APP_DIR, item);
            const hiddenPath = path.join(APP_DIR, `${TEMP_PREFIX}${item}`);

            if (renameSafe(originalPath, hiddenPath)) {
                hiddenItems.push({ original: originalPath, hidden: hiddenPath });
                console.log(`   🙈 Hiding ${item}`);
            }
        }

        // 2. Swap Root Page: Dashboard -> Landing Page
        // We want the component from src/app/w/page.tsx to be served at /

        // Backup Dashboard Page
        if (renameSafe(DASHBOARD_PAGE, DASHBOARD_PAGE_TEMP)) {
            console.log('   📦 Backing up Dashboard Root');

            // Read Landing Page Content
            let landingContent = fs.readFileSync(LANDING_PAGE, 'utf-8');

            // Write Landing Page content to Root
            fs.writeFileSync(DASHBOARD_PAGE, landingContent);
            console.log('   ✨ Promoting Landing Page to Root');
            dashboardSwapped = true;
        }

        // 3. Run Build
        console.log('\n🏗️  Running Next.js Build (Static Export mode)...\n');
        execSync('NEXT_PUBLIC_BUILD_MODE=static next build', { stdio: 'inherit', env: { ...process.env, NEXT_PUBLIC_BUILD_MODE: 'static' } });

        console.log('\n✅ Build Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Build Failed:', error.message);
        process.exitCode = 1;
    } finally {
        console.log('\n🧹 Cleaning up...');

        // Restore Dashboard Root
        if (dashboardSwapped) {
            // Delete the temporary "Landing at Root" file
            if (fs.existsSync(DASHBOARD_PAGE)) {
                fs.unlinkSync(DASHBOARD_PAGE);
            }
            // Restore original Dashboard file
            renameSafe(DASHBOARD_PAGE_TEMP, DASHBOARD_PAGE);
            console.log('   Restored Dashboard Root');
        }

        // Restore Hidden Folders
        for (const { original, hidden } of hiddenItems) {
            renameSafe(hidden, original);
        }
        console.log('   Restored Dynamic Routes');
    }
}

build();
