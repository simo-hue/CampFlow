const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/app');
const logImport = "import { logger } from '@/lib/logger';\n";
const excludeDirs = ['api'];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (excludeDirs.includes(file) && dir === targetDir) {
            continue; // Skip src/app/api entirely
        }
        
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We only care if there is a console.error and no logger.error
    if (content.includes('console.error(')) {
        // Add import after the first import statement or at the top if not present
        if (!content.includes("import { logger } from '@/lib/logger';")) {
            const useClientMatch = content.match(/^['"]use client['"];?\n/m);
            const importMatch = content.match(/^import .*?;?\n/m);
            
            if (useClientMatch && importMatch) {
                // If it has 'use client' and an import, add logger after 'use client'
                content = content.replace(useClientMatch[0], useClientMatch[0] + logImport);
            } else if (importMatch) {
                content = content.replace(importMatch[0], importMatch[0] + logImport);
            } else {
                content = logImport + content;
            }
        }

        let modified = false;
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('console.error(')) {
                // Check if it's already commented or somehow part of logger-server.ts logic (we exclude api so shouldn't hit logger-server but let's be safe)
                if (filePath.includes('logger.ts') || filePath.includes('logger-server.ts')) continue;
                
                // Replace console.error with logger.error
                lines[i] = lines[i].replace(/console\.error\(/g, 'logger.error(');
                modified = true;
            }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, lines.join('\n'));
            console.log('Updated:', filePath);
        }
    }
}

processDir(targetDir);
