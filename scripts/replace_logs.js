const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/app/api');
const logImport = "import { logToDb } from '@/lib/logger-server';\n";

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
    
    if (content.includes('console.error(') && !content.includes('import { logToDb }')) {
        // Add import after the first import statement or at the top
        const importMatch = content.match(/^import .*?;?\n/m);
        if (importMatch) {
            content = content.replace(importMatch[0], importMatch[0] + logImport);
        } else {
            content = logImport + content;
        }
    }

    // Replace console.error with await logToDb('error', ...)
    // This is a bit tricky with regex because of varying arguments.
    // Let's use a regex that matches console.error(...)
    // Note: this simple regex assumes console.error is on a single line
    let modified = false;
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('console.error(')) {
            // Replace console.error(arg1, arg2) with logToDb('error', arg1, arg2)
            // also keep the console.error for standard output
            const match = lines[i].match(/console\.error\((.*)\);?/);
            if (match) {
                const args = match[1];
                const indent = lines[i].match(/^\s*/)[0];
                const replacement = `${indent}await logToDb('error', ${args});\n${lines[i]}`;
                lines[i] = replacement;
                modified = true;
            }
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log('Updated:', filePath);
    }
}

processDir(targetDir);
