import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(__dirname, '..');
const ROOT_DIR = path.resolve(__dirname, '../..');
const MAX_SOURCE_FILE_LINES = 320;

function walkSync(dir: string): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        results = results.concat(walkSync(fullPath));
      }
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

function isPureReExportShim(filePath: string, content: string): boolean {
  const fileName = path.basename(filePath);
  if (fileName === 'index.ts' || fileName === 'index.tsx') {
    return false;
  }
  // Remove block comments, line comments, and whitespace
  const cleaned = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .trim();

  if (!cleaned) return false;

  const lines = cleaned
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    lines.length > 0 &&
    lines.every(
      (line) =>
        (line.startsWith('export * from') ||
          line.startsWith('export type * from') ||
          /^export\s*\{[\s\S]*?\}\s*from\s*['"].*['"];?$/.test(line) ||
          /^export\s*type\s*\{[\s\S]*?\}\s*from\s*['"].*['"];?$/.test(line)) &&
        line.endsWith(';')
    )
  );
}

describe('Executable Quality & Architecture Rules', () => {
  const allSourceFiles = walkSync(SRC_DIR);
  const nonTestFiles = allSourceFiles.filter((f) => !f.includes('/__tests__/'));

  it('ensures no non-barrel file acts as a pure re-export shim', () => {
    const reExportShims: string[] = [];

    for (const file of nonTestFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (isPureReExportShim(file, content)) {
        reExportShims.push(path.relative(ROOT_DIR, file));
      }
    }

    expect(
      reExportShims,
      `Non-barrel shim files detected: ${reExportShims.join(', ')}`
    ).toHaveLength(0);
  });

  it(`ensures all source files stay below ${MAX_SOURCE_FILE_LINES} lines`, () => {
    const oversizedFiles: { file: string; lineCount: number }[] = [];

    for (const file of nonTestFiles) {
      const lineCount = fs.readFileSync(file, 'utf8').split('\n').length;
      if (lineCount > MAX_SOURCE_FILE_LINES) {
        oversizedFiles.push({ file: path.relative(ROOT_DIR, file), lineCount });
      }
    }

    expect(
      oversizedFiles,
      `Source files exceeding line limit: ${oversizedFiles.map((f) => `${f.file} (${f.lineCount})`).join(', ')}`
    ).toHaveLength(0);
  });

  it('ensures console methods are not used in application source code outside scripts/', () => {
    const consoleUsages: string[] = [];
    const consolePattern = /\bconsole\.(log|warn|error|info|debug)\b/;

    for (const file of nonTestFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (consolePattern.test(content)) {
        consoleUsages.push(path.relative(ROOT_DIR, file));
      }
    }

    expect(
      consoleUsages,
      `Console methods found in source files: ${consoleUsages.join(', ')}`
    ).toHaveLength(0);
  });

  it('ensures all required project documentation files exist and are non-empty', () => {
    const requiredDocs = [
      'docs/ARCHITECTURE.md',
      'docs/TESTING.md',
      'docs/DECISIONS.md',
      'docs/SECURITY.md',
      'docs/ACCESSIBILITY.md',
      'CONTRIBUTING.md',
      'README.md',
      'AGENTS.md',
    ];

    const missingDocs: string[] = [];
    for (const doc of requiredDocs) {
      const fullPath = path.join(ROOT_DIR, doc);
      if (!fs.existsSync(fullPath) || fs.statSync(fullPath).size < 100) {
        missingDocs.push(doc);
      }
    }

    expect(
      missingDocs,
      `Missing or empty required documentation: ${missingDocs.join(', ')}`
    ).toHaveLength(0);
  });
});
