/* eslint-disable no-undef */
/**
 * Publish helper
 *
 * Usage:
 *   node tools/publish-lib.mjs          # publish
 *   node tools/publish-lib.mjs --dry    # dry run
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const isDry = process.argv.includes('--dry');
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

console.info(
  `Publishing ${pkg.name}@${pkg.version}${isDry ? ' (dry run)' : ''}…`,
);

const cmd = isDry
  ? 'npm publish --dry-run --access public'
  : 'npm publish --access public';

try {
  execSync(cmd, { stdio: 'inherit' });
  console.info('Done.');
} catch (err) {
  console.error('Publish failed:', err.message);
  process.exit(1);
}
