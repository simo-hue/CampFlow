const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/app');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'api' && dir === targetDir) continue;
        
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
    let modified = false;
    
    // We want to fix cases like:
    // 1. logger.error(error)
    // 2. logger.error('Message', error)
    
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('logger.error(')) {
            // Very naive replacements tailored to the typical patterns we saw
            
            // Fix: logger.error(error);
            if (lines[i].match(/logger\.error\(\s*error\s*\)/)) {
                lines[i] = lines[i].replace(/logger\.error\(\s*error\s*\)/, "logger.error(error instanceof Error ? error.message : String(error), { error })");
                modified = true;
            }
            // Fix: logger.error(err);
            else if (lines[i].match(/logger\.error\(\s*err\s*\)/)) {
                lines[i] = lines[i].replace(/logger\.error\(\s*err\s*\)/, "logger.error(err instanceof Error ? err.message : String(err), { error: err })");
                modified = true;
            }
            // Fix: logger.error('Message', error);
            else if (lines[i].match(/logger\.error\((['"`].*?['"`]),\s*error\)/)) {
                lines[i] = lines[i].replace(/logger\.error\((['"`].*?['"`]),\s*error\)/, "logger.error($1, { error })");
                modified = true;
            }
            // Fix: logger.error('Message', err);
            else if (lines[i].match(/logger\.error\((['"`].*?['"`]),\s*err\)/)) {
                lines[i] = lines[i].replace(/logger\.error\((['"`].*?['"`]),\s*err\)/, "logger.error($1, { error: err })");
                modified = true;
            }
            // Fix: logger.error('Message', upsertErr);
            else if (lines[i].match(/logger\.error\((['"`].*?['"`]),\s*upsertErr\)/)) {
                lines[i] = lines[i].replace(/logger\.error\((['"`].*?['"`]),\s*upsertErr\)/, "logger.error($1, { error: upsertErr })");
                modified = true;
            }
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log('Fixed:', filePath);
    }
}

processDir(targetDir);
