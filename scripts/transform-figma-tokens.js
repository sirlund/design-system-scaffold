#!/usr/bin/env node

/**
 * Transform Figma Exported Tokens to Primitive Tokens
 *
 * Reads JSON files from imported-from-figma/ and generates:
 * - TypeScript files in src/figma-tokens/
 * - CSS files in src/figma-tokens/
 *
 * These are PRIMITIVE tokens - do not edit manually.
 * Semantic tokens should ALWAYS reference these primitives.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMPORTED_DIR = path.join(__dirname, '../imported-from-figma');
const OUTPUT_DIR = path.join(__dirname, '../src/figma-tokens');

/**
 * Resolve token references like "{Green.green05}" to actual values
 */
function resolveTokenValue(value, allTokens) {
  if (typeof value !== 'string') return value;

  const match = value.match(/^\{(.+)\}$/);
  if (!match) return value;

  const [group, token] = match[1].split('.');
  return allTokens[group]?.[token]?.$value || value;
}

/**
 * Remove redundant prefixes from token names
 * Examples:
 * - "Radius-radius-small" → "radius-small"
 * - "Spacing-space-small" → "space-small"
 * - "Secondary-Brown-brown00" → "brown-00"
 * - "Primary-primaryMain" → "primary-main"
 */
function cleanTokenName(name) {
  // Split by dash
  let parts = name.split('-');

  // Remove "Secondary" prefix if present (it's just a grouping in Figma)
  if (parts[0].toLowerCase() === 'secondary' && parts.length >= 3) {
    parts.shift(); // Remove "Secondary"
  }

  // Remove first part if it's redundant with second part
  if (parts.length >= 2) {
    const firstPart = parts[0].toLowerCase();
    const secondPart = parts[1].toLowerCase();

    // Check if both share a common root (e.g., "spacing"/"space", "brown"/"brown")
    const longestCommonPrefix = (a, b) => {
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return i;
    };

    const commonLength = longestCommonPrefix(firstPart, secondPart);

    // If they share at least 4 characters, or second starts with first, remove first part
    if (commonLength >= 4 || secondPart.startsWith(firstPart) || firstPart.startsWith(secondPart)) {
      parts.shift();
    }
  }

  // Convert camelCase to kebab-case (e.g., "brown00" → "brown-00")
  // Also handle special characters like & → -
  return parts
    .join('-')
    .replace(/&/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-z])(\d)/g, '$1-$2') // Add dash before numbers (brown00 → brown-00)
    .toLowerCase();
}

/**
 * Flatten nested token structure and resolve references
 * Handles both 2-level and 3-level nesting
 */
function flattenTokens(data, prefix = '') {
  const flat = {};

  for (const [key, value] of Object.entries(data)) {
    const currentPath = prefix ? `${prefix}-${key}` : key;

    // Check if this has $value (leaf node)
    if (value.$value !== undefined) {
      flat[currentPath] = value.$value;
    }
    // Otherwise recurse deeper
    else if (typeof value === 'object' && value !== null) {
      const nested = flattenTokens(value, currentPath);
      Object.assign(flat, nested);
    }
  }

  // Resolve references
  const resolved = {};
  for (const [key, value] of Object.entries(flat)) {
    const cleanedKey = cleanTokenName(key);
    resolved[cleanedKey] = resolveTokenValue(value, data);
  }

  return resolved;
}

/**
 * Transform Colors.json
 * Only processes PRIMITIVE color tokens (pure scales without semantic meaning)
 *
 * Primitive groups (included):
 * - Green, Greyscale: Pure color scales (green01-10, grey01-10)
 * - Secondary: Color palette scales (Brown, Orange, Peach, Blue, Purple, Yellow)
 *
 * Semantic groups (excluded - should be in semantic-colors.ts):
 * - Primary, B&W, Text, Brand, System
 */
function transformColors() {
  console.log('🎨 Transforming Colors...');

  const colorsPath = path.join(IMPORTED_DIR, 'Colors.json');
  const colorsData = JSON.parse(fs.readFileSync(colorsPath, 'utf-8'));

  // Only process primitive color groups (pure scales without semantic meaning)
  const PRIMITIVE_COLOR_GROUPS = ['Green', 'Greyscale', 'Secondary', 'Base'];
  const primitiveData = {};

  for (const group of PRIMITIVE_COLOR_GROUPS) {
    if (colorsData[group]) {
      primitiveData[group] = colorsData[group];
    }
  }

  const flatTokens = flattenTokens(primitiveData);

  // Generate TypeScript
  let ts = `/**
 * Color Tokens - Auto-generated from Figma
 * Source: imported-from-figma/Colors.json
 * DO NOT EDIT MANUALLY - Run 'npm run tokens:transform' to regenerate
 */

export const primitiveColors = {
`;

  for (const [key, value] of Object.entries(flatTokens)) {
    const comment = `// ${key.replace('-', '/')}`;
    ts += `  '${key}': '${value}', ${comment}\n`;
  }

  ts += `} as const;

export type PrimitiveColorToken = keyof typeof primitiveColors;
`;

  // Generate CSS
  let css = `/**
 * Color Tokens - Auto-generated from Figma
 * Source: imported-from-figma/Colors.json
 * DO NOT EDIT MANUALLY - Run 'npm run tokens:transform' to regenerate
 */

:root {
`;

  for (const [key, value] of Object.entries(flatTokens)) {
    css += `  --primitive-${key}: ${value};\n`;
  }

  css += `}\n`;

  // Write files
  const colorsDir = path.join(OUTPUT_DIR, 'colors');
  fs.mkdirSync(colorsDir, { recursive: true });

  fs.writeFileSync(path.join(colorsDir, 'colors.ts'), ts);
  fs.writeFileSync(path.join(colorsDir, 'colors.css'), css);

  console.log(`  ✅ Generated ${Object.keys(flatTokens).length} color tokens`);
  return flatTokens;
}

/**
 * Transform Shapes.json (radius)
 */
function transformRadius() {
  console.log('📐 Transforming Radius...');

  const shapesPath = path.join(IMPORTED_DIR, 'Shapes.json');
  const shapesData = JSON.parse(fs.readFileSync(shapesPath, 'utf-8'));

  const radiusTokens = flattenTokens(shapesData);

  // Generate TypeScript
  let ts = `/**
 * Radius Tokens - Auto-generated from Figma
 * Source: imported-from-figma/Shapes.json
 * DO NOT EDIT MANUALLY - Run 'npm run tokens:transform' to regenerate
 */

export const primitiveRadius = {
`;

  for (const [key, value] of Object.entries(radiusTokens)) {
    const comment = `// ${key.replace(/-/g, '/')}`;
    ts += `  '${key}': '${value}', ${comment}\n`;
  }

  ts += `} as const;

export type PrimitiveRadiusToken = keyof typeof primitiveRadius;
`;

  // Generate CSS
  let css = `/**
 * Radius Tokens - Auto-generated from Figma
 * Source: imported-from-figma/Shapes.json
 * DO NOT EDIT MANUALLY - Run 'npm run tokens:transform' to regenerate
 */

:root {
`;

  for (const [key, value] of Object.entries(radiusTokens)) {
    css += `  --primitive-${key}: ${value};\n`;
  }

  css += `}\n`;

  // Write files
  const radiusDir = path.join(OUTPUT_DIR, 'radius');
  fs.mkdirSync(radiusDir, { recursive: true });

  fs.writeFileSync(path.join(radiusDir, 'radius.ts'), ts);
  fs.writeFileSync(path.join(radiusDir, 'radius.css'), css);

  console.log(`  ✅ Generated ${Object.keys(radiusTokens).length} radius tokens`);
  return radiusTokens;
}

/**
 * Transform Size&Spacing.json
 */
function transformSpacing() {
  console.log('📏 Transforming Spacing...');

  const spacingPath = path.join(IMPORTED_DIR, 'Size&Spacing.json');
  const spacingData = JSON.parse(fs.readFileSync(spacingPath, 'utf-8'));

  const allTokens = flattenTokens(spacingData);

  // Separate spacing and size tokens
  const spacingTokens = {};
  const sizeTokens = {};

  for (const [key, value] of Object.entries(allTokens)) {
    if (key.startsWith('space-')) {
      spacingTokens[key] = value;
    } else if (key.startsWith('size-')) {
      sizeTokens[key] = value;
    }
  }

  // Generate TypeScript
  let ts = `/**
 * Spacing & Size Tokens - Auto-generated from Figma
 * Source: imported-from-figma/Size&Spacing.json
 * DO NOT EDIT MANUALLY - Run 'npm run tokens:transform' to regenerate
 */

export const primitiveSpacing = {
`;

  for (const [key, value] of Object.entries(spacingTokens)) {
    const comment = `// ${key.replace(/-/g, '/')}`;
    ts += `  '${key}': '${value}', ${comment}\n`;
  }

  ts += `} as const;

export const primitiveSize = {
`;

  for (const [key, value] of Object.entries(sizeTokens)) {
    const comment = `// ${key.replace(/-/g, '/')}`;
    ts += `  '${key}': '${value}', ${comment}\n`;
  }

  ts += `} as const;

export type PrimitiveSpacingToken = keyof typeof primitiveSpacing;
export type PrimitiveSizeToken = keyof typeof primitiveSize;
`;

  // Generate CSS
  let css = `/**
 * Spacing & Size Tokens - Auto-generated from Figma
 * Source: imported-from-figma/Size&Spacing.json
 * DO NOT EDIT MANUALLY - Run 'npm run tokens:transform' to regenerate
 */

:root {
  /* Spacing Tokens */
`;

  for (const [key, value] of Object.entries(spacingTokens)) {
    css += `  --primitive-${key}: ${value};\n`;
  }

  css += `\n  /* Size Tokens */\n`;

  for (const [key, value] of Object.entries(sizeTokens)) {
    css += `  --primitive-${key}: ${value};\n`;
  }

  css += `}\n`;

  // Write files
  const spacingDir = path.join(OUTPUT_DIR, 'spacing');
  fs.mkdirSync(spacingDir, { recursive: true });

  fs.writeFileSync(path.join(spacingDir, 'spacing.ts'), ts);
  fs.writeFileSync(path.join(spacingDir, 'spacing.css'), css);

  console.log(`  ✅ Generated ${Object.keys(spacingTokens).length} spacing + ${Object.keys(sizeTokens).length} size tokens`);
  return { spacing: spacingTokens, size: sizeTokens };
}

/**
 * Generate index file
 */
function generateIndex() {
  console.log('📦 Generating index...');

  const indexTs = `/**
 * Figma Primitive Tokens Index
 * Auto-generated - DO NOT EDIT MANUALLY
 */

export * from './colors/colors';
export * from './radius/radius';
export * from './spacing/spacing';
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), indexTs);
  console.log('  ✅ Generated index.ts');
}

/**
 * Main transformation
 */
function main() {
  console.log('🚀 Transforming Figma Tokens to Primitives\n');
  console.log('═'.repeat(50) + '\n');

  try {
    const colors = transformColors();
    const radius = transformRadius();
    const spacing = transformSpacing();
    generateIndex();

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Transformation complete!');
    console.log('\n📁 Files generated in: src/figma-tokens/');
    console.log('\n⚠️  IMPORTANT: Update semantic tokens to reference these primitives!');
    console.log('   Semantic tokens should NEVER have hardcoded values.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
