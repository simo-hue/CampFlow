const fs = require('fs');
const path = require('path');

const targetDirs = [path.join(__dirname, '../src/components'), path.join(__dirname, '../src/lib')];
const logImport = "import { logger } from '@/lib/logger';\n";

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
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
    
    // Skip backup files
    if (filePath.includes('.bak') || filePath.includes('.backup')) return;
    if (filePath.includes('logger.ts') || filePath.includes('logger-server.ts')) return;

    if (content.includes('console.error(')) {
        if (!content.includes("import { logger } from '@/lib/logger';")) {
            const useClientMatch = content.match(/^['"]use client['"];?\n/m);
            const importMatch = content.match(/^import .*?;?\n/m);
            
            if (useClientMatch && importMatch) {
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
                lines[i] = lines[i].replace(/console\.error\(/g, 'logger.error(');
                
                // Also immediately fix signatures to save time
                if (lines[i].match(/logger\.error\(\s*error\s*\)/)) {
                    lines[i] = lines[i].replace(/logger\.error\(\s*error\s*\)/, "logger.error(error instanceof Error ? error.message : String(error), { error })");
                }
                else if (lines[i].match(/logger\.error\(\s*err\s*\)/)) {
                    lines[i] = lines[i].replace(/logger\.error\(\s*err\s*\)/, "logger.error(err instanceof Error ? err.message : String(err), { error: err })");
                }
                else if (lines[i].match(/logger\.error\(\s*e\s*\)/)) {
                    lines[i] = lines[i].replace(/logger\.error\(\s*e\s*\)/, "logger.error(e instanceof Error ? e.message : String(e), { error: e })");
                }
                else if (lines[i].match(/logger\.error\((['"`].*?['"`]),\s*error\)/)) {
                    lines[i] = lines[i].replace(/logger\.error\((['"`].*?['"`]),\s*error\)/, "logger.error($1, { error })");
                }
                else if (lines[i].match(/logger\.error\((['"`].*?['"`]),\s*err\)/)) {
                    lines[i] = lines[i].replace(/logger\.error\((['"`].*?['"`]),\s*err\)/, "logger.error($1, { error: err })");
                }
                else if (lines[i].match(/logger\.error\((['"`].*?['"`]),\s*errorInfo\)/)) {
                    lines[i] = lines[i].replace(/logger\.error\((['"`].*?['"`]),\s*errorInfo\)/, "logger.error($1, { errorInfo })");
                }
                
                modified = true;
            }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, lines.join('\n'));
            console.log('Updated:', filePath);
        }
    }
}

targetDirs.forEach(processDir);
