#!/usr/bin/env node

/**
 * DEPRECATED: Legacy W3C Token Transformer
 *
 * ⚠️  This script is DEPRECATED and will be removed in a future version.
 *
 * Please use the new universal token parser instead:
 *   npm run tokens:transform
 *
 * The universal parser supports W3C format PLUS many others:
 * - W3C Design Tokens Community Group format (with cross-file references)
 * - Tokens Studio (Figma Tokens) format
 * - Style Dictionary format
 * - Simple key-value formats
 *
 * ---
 *
 * W3C Design Tokens Transformer
 *
 * Transforms W3C Design Tokens format to TypeScript + CSS
 * Supports $type, $value, and {reference} syntax
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  loadW3CTokenFiles,
  classifyTokens,
  groupByCategory,
  toCSSVariableName,
  toTypeScriptName,
  generateStats,
} from './w3c-token-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load configuration
const configPath = path.join(rootDir, 'tokens.config.js');
const { default: config } = await import(configPath);

console.log('🚀 Transforming W3C Design Tokens\n');
console.log('══════════════════════════════════════════════════\n');

// Step 1: Load all W3C token files
const inputDir = path.join(rootDir, config.inputDir);
const allTokens = loadW3CTokenFiles(inputDir);

// Step 2: Classify tokens
const { primitives, semantics } = classifyTokens(allTokens);

// Step 3: Group by category
const primitivesGrouped = groupByCategory(primitives);
const semanticsGrouped = groupByCategory(semantics);

// Step 4: Generate statistics
const stats = generateStats(allTokens);

console.log('📊 Token Statistics:\n');
console.log(`   Total tokens: ${stats.total}`);
console.log(`   Primitives: ${stats.primitives}`);
console.log(`   Semantics: ${stats.semantics}`);
console.log(`\n   By type:`);
console.log(`   - Colors: ${stats.byType.colors}`);
console.log(`   - Dimensions: ${stats.byType.dimensions}`);
console.log(`   - Font Families: ${stats.byType.fontFamilies}`);
console.log(`   - Font Weights: ${stats.byType.fontWeights}`);
console.log(`   - Durations: ${stats.byType.durations}`);
console.log(`   - Other: ${stats.byType.other}`);
console.log('');

// Step 5: Generate primitive tokens
console.log('🎨 Generating Primitive Tokens...\n');
generatePrimitiveTokens(primitivesGrouped);

// Step 6: Generate semantic tokens
console.log('\n🏷️  Generating Semantic Tokens...\n');
generateSemanticTokens(semanticsGrouped, primitives);

console.log('\n✅ Token transformation complete!\n');

/**
 * Generate primitive token files (TypeScript + CSS)
 */
function generatePrimitiveTokens(grouped) {
  const outputDir = path.join(rootDir, config.outputDir);

  // Colors
  if (Object.keys(grouped.colors).length > 0) {
    const colorsDir = path.join(outputDir, 'colors');
    fs.mkdirSync(colorsDir, { recursive: true });

    generateTokenFile(
      grouped.colors,
      colorsDir,
      'colors',
      config.cssPrefix.primitive,
      true
    );
    console.log(`   ✓ Primitive colors (${Object.keys(grouped.colors).length} tokens)`);
  }

  // Dimensions (spacing)
  if (Object.keys(grouped.dimensions).length > 0) {
    const spacingDir = path.join(outputDir, 'spacing');
    fs.mkdirSync(spacingDir, { recursive: true });

    generateTokenFile(
      grouped.dimensions,
      spacingDir,
      'spacing',
      config.cssPrefix.primitive,
      true
    );
    console.log(`   ✓ Primitive spacing (${Object.keys(grouped.dimensions).length} tokens)`);
  }
}

/**
 * Generate semantic token files (TypeScript + CSS)
 */
function generateSemanticTokens(grouped, primitives) {
  const outputDir = path.join(rootDir, config.semanticDir);

  // Colors
  if (Object.keys(grouped.colors).length > 0) {
    const colorsDir = path.join(outputDir, 'colors');
    fs.mkdirSync(colorsDir, { recursive: true });

    generateSemanticColorFile(grouped.colors, primitives, colorsDir);
    console.log(`   ✓ Semantic colors (${Object.keys(grouped.colors).length} tokens)`);
  }
}

/**
 * Generate TypeScript + CSS files for tokens
 */
function generateTokenFile(tokens, outputDir, name, cssPrefix, isPrimitive) {
  // Generate TypeScript
  const tsContent = generateTypeScript(tokens, name, isPrimitive);
  fs.writeFileSync(path.join(outputDir, `${name}.ts`), tsContent);

  // Generate CSS
  const cssContent = generateCSS(tokens, cssPrefix);
  fs.writeFileSync(path.join(outputDir, `${name}.css`), cssContent);
}

/**
 * Generate TypeScript token exports
 */
function generateTypeScript(tokens, name, isPrimitive) {
  const tokenEntries = Object.entries(tokens)
    .map(([tokenName, token]) => {
      const tsName = toTypeScriptName(tokenName);
      const value = token.value;
      const comment = token.description ? `  // ${token.description}\n` : '';
      return `${comment}  '${tsName}': '${value}'`;
    })
    .join(',\n');

  const exportName = isPrimitive ? `primitive${capitalize(name)}` : name;

  return `/**
 * ${isPrimitive ? 'Primitive' : 'Semantic'} ${capitalize(name)} Tokens
 *
 * ${isPrimitive ? 'Auto-generated from Figma W3C Design Tokens' : 'Semantic tokens that reference primitives'}
 * ${isPrimitive ? 'DO NOT EDIT MANUALLY' : 'Generated from W3C Design Tokens'}
 */

export const ${exportName} = {
${tokenEntries}
} as const;

export type ${capitalize(exportName)}Key = keyof typeof ${exportName};
`;
}

/**
 * Generate CSS custom properties
 */
function generateCSS(tokens, prefix) {
  const cssVars = Object.entries(tokens)
    .map(([tokenName, token]) => {
      const cssVarName = toCSSVariableName(tokenName, prefix);
      const value = token.value;
      const comment = token.description ? `  /* ${token.description} */\n` : '';
      return `${comment}  --${cssVarName}: ${value};`;
    })
    .join('\n');

  return `/**
 * ${prefix ? capitalize(prefix) : 'Design'} Tokens CSS Variables
 *
 * Auto-generated from W3C Design Tokens
 * DO NOT EDIT MANUALLY
 */

:root {
${cssVars}
}
`;
}

/**
 * Generate semantic color file with proper grouping
 */
function generateSemanticColorFile(tokens, primitives, outputDir) {
  // Group semantic tokens by their top-level category
  const groups = {};

  for (const [tokenName, token] of Object.entries(tokens)) {
    const topLevel = token.path[0]; // System, Feedback, etc.
    if (!groups[topLevel]) {
      groups[topLevel] = {};
    }
    groups[topLevel][tokenName] = token;
  }

  // Generate TypeScript with groups
  let tsContent = `/**
 * Semantic Color Tokens
 *
 * Generated from W3C Design Tokens
 * These tokens reference primitive colors
 */

`;

  const allExports = [];

  for (const [groupName, groupTokens] of Object.entries(groups)) {
    const exportName = `${groupName.toLowerCase()}Colors`;
    allExports.push(exportName);

    const tokenEntries = Object.entries(groupTokens)
      .map(([tokenName, token]) => {
        const tsName = toTypeScriptName(tokenName.replace(`${groupName}.`, ''));
        const cssVarName = toCSSVariableName(tokenName, config.cssPrefix.semantic);
        return `  '${tsName}': 'var(--${cssVarName})'`;
      })
      .join(',\n');

    tsContent += `export const ${exportName} = {\n${tokenEntries}\n} as const;\n\n`;
  }

  fs.writeFileSync(path.join(outputDir, 'colors.ts'), tsContent);

  // Generate CSS
  const cssVars = Object.entries(tokens)
    .map(([tokenName, token]) => {
      const cssVarName = toCSSVariableName(tokenName, config.cssPrefix.semantic);
      const primitiveRef = token.references;
      const primitiveCSSVar = toCSSVariableName(primitiveRef, config.cssPrefix.primitive);
      return `  --${cssVarName}: var(--${primitiveCSSVar});`;
    })
    .join('\n');

  const cssContent = `/**
 * Semantic Color Tokens CSS Variables
 *
 * Generated from W3C Design Tokens
 * References primitive color tokens
 */

:root {
${cssVars}
}
`;

  fs.writeFileSync(path.join(outputDir, 'colors.css'), cssContent);
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
