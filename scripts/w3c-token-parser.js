/**
 * DEPRECATED: Legacy W3C Token Parser
 *
 * ⚠️  This utility is DEPRECATED and will be removed in a future version.
 *
 * Please use the new universal token parser instead:
 *   node scripts/universal-token-parser.js imported-from-figma
 *
 * The universal parser has better W3C support including:
 * - Cross-file reference resolution
 * - Proper handling of special characters in token names
 * - Support for additional formats beyond W3C
 *
 * ---
 *
 * W3C Design Tokens Parser
 *
 * Parses W3C Design Tokens format ($type, $value, {references})
 * and converts to flat token structure for our transformation pipeline.
 */

import fs from 'fs';
import path from 'path';

/**
 * Parse W3C Design Tokens JSON files
 * @param {string} filePath - Path to W3C tokens JSON file
 * @returns {Object} Parsed tokens with resolved references
 */
export function parseW3CTokens(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tokens = JSON.parse(content);

  // Step 1: Flatten the nested structure and collect all tokens
  const flatTokens = flattenTokens(tokens);

  // Step 2: Resolve all references ({Base.Grey.200} -> #eaeaea)
  const resolvedTokens = resolveReferences(flatTokens);

  return resolvedTokens;
}

/**
 * Flatten nested W3C token structure
 * Converts: { Base: { Grey: { 100: { $type, $value } } } }
 * To: { 'Base.Grey.100': { type: 'color', value: '#fff', path: ['Base', 'Grey', '100'] } }
 */
function flattenTokens(obj, path = [], result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    // Skip metadata keys
    if (key.startsWith('$')) continue;

    const currentPath = [...path, key];

    // Check if this is a token (has $value)
    if (value && typeof value === 'object' && '$value' in value) {
      const tokenName = currentPath.join('.');
      result[tokenName] = {
        type: value.$type || 'unknown',
        value: value.$value,
        path: currentPath,
        description: value.$description || '',
      };
    } else if (value && typeof value === 'object') {
      // Continue flattening nested groups
      flattenTokens(value, currentPath, result);
    }
  }

  return result;
}

/**
 * Resolve token references
 * Converts: { value: '{Base.Grey.200}' }
 * To: { value: '#eaeaea' }
 */
function resolveReferences(tokens, maxDepth = 10) {
  const resolved = { ...tokens };

  // Keep resolving until no more references or max depth reached
  for (let depth = 0; depth < maxDepth; depth++) {
    let hasUnresolved = false;

    for (const [tokenName, token] of Object.entries(resolved)) {
      const value = token.value;

      // Check if value is a reference: {Token.Name}
      // Updated regex to allow any characters except } inside the braces
      if (typeof value === 'string' && value.match(/^\{[^}]+\}$/)) {
        const referenceName = value.slice(1, -1); // Remove { and }

        if (resolved[referenceName]) {
          resolved[tokenName].value = resolved[referenceName].value;
          resolved[tokenName].references = referenceName;
          hasUnresolved = true;
        } else {
          console.warn(`⚠️  Token reference not found: ${referenceName} (used in ${tokenName})`);
        }
      }
    }

    if (!hasUnresolved) break;
  }

  return resolved;
}

/**
 * Classify tokens as primitive or semantic
 * Primitives: Have actual values (hex, px, etc.) OR dimension tokens referencing other dimensions
 * Semantics: Reference other tokens (originally had {references})
 */
export function classifyTokens(tokens) {
  const primitives = {};
  const semantics = {};

  for (const [tokenName, token] of Object.entries(tokens)) {
    // If it has a 'references' field, it was originally a reference
    if (token.references) {
      // Special case: dimension tokens that reference other dimensions are primitives
      // (e.g., Gap.M -> scale.200_(16px), Radius.L -> scale.150_(12px))
      const isDimensionReferencingDimension =
        token.type === 'dimension' &&
        tokens[token.references]?.type === 'dimension';

      if (isDimensionReferencingDimension) {
        primitives[tokenName] = token;
      } else {
        semantics[tokenName] = token;
      }
    } else {
      primitives[tokenName] = token;
    }
  }

  return { primitives, semantics };
}

/**
 * Group tokens by category (colors, spacing, etc.)
 */
export function groupByCategory(tokens) {
  const groups = {
    colors: {},
    dimensions: {},
    fontFamilies: {},
    fontWeights: {},
    durations: {},
    other: {},
  };

  for (const [tokenName, token] of Object.entries(tokens)) {
    const type = token.type;

    if (type === 'color') {
      groups.colors[tokenName] = token;
    } else if (type === 'dimension') {
      groups.dimensions[tokenName] = token;
    } else if (type === 'fontFamily') {
      groups.fontFamilies[tokenName] = token;
    } else if (type === 'fontWeight') {
      groups.fontWeights[tokenName] = token;
    } else if (type === 'duration') {
      groups.durations[tokenName] = token;
    } else {
      groups.other[tokenName] = token;
    }
  }

  return groups;
}

/**
 * Convert token name to CSS variable name
 * Base.Grey.200 -> base-grey-200
 */
export function toCSSVariableName(tokenName, prefix = '') {
  const kebab = tokenName
    .replace(/\./g, '-')           // Base.Grey.200 -> Base-Grey-200
    .replace(/([a-z])([A-Z])/g, '$1-$2')  // camelCase -> kebab-case
    .toLowerCase()                 // -> base-grey-200
    .replace(/_/g, '-');           // Replace underscores with hyphens

  return prefix ? `${prefix}-${kebab}` : kebab;
}

/**
 * Convert token name to TypeScript property name
 * Base.Grey.200 -> baseGrey200
 */
export function toTypeScriptName(tokenName) {
  return tokenName
    .split('.')
    .map((part, index) => {
      // First part: lowercase
      if (index === 0) {
        return part.charAt(0).toLowerCase() + part.slice(1);
      }
      // Other parts: capitalize first letter
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('')
    .replace(/_/g, '');
}

/**
 * Load all W3C token files from a directory
 */
export function loadW3CTokenFiles(directory) {
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.tokens.json'));
  const allFlatTokens = {};

  console.log(`\n📦 Loading W3C Design Tokens from: ${directory}\n`);

  // Step 1: Load and flatten ALL files first (don't resolve yet)
  for (const file of files) {
    const filePath = path.join(directory, file);
    console.log(`   📄 ${file}`);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const tokens = JSON.parse(content);
      const flatTokens = flattenTokens(tokens);
      Object.assign(allFlatTokens, flatTokens);
    } catch (error) {
      console.error(`   ❌ Error parsing ${file}:`, error.message);
    }
  }

  // Step 2: Now resolve references across ALL tokens
  const resolvedTokens = resolveReferences(allFlatTokens);

  console.log(`\n✅ Loaded ${Object.keys(resolvedTokens).length} tokens\n`);

  return resolvedTokens;
}

/**
 * Generate summary statistics
 */
export function generateStats(tokens) {
  const { primitives, semantics } = classifyTokens(tokens);
  const grouped = groupByCategory(tokens);

  return {
    total: Object.keys(tokens).length,
    primitives: Object.keys(primitives).length,
    semantics: Object.keys(semantics).length,
    byType: {
      colors: Object.keys(grouped.colors).length,
      dimensions: Object.keys(grouped.dimensions).length,
      fontFamilies: Object.keys(grouped.fontFamilies).length,
      fontWeights: Object.keys(grouped.fontWeights).length,
      durations: Object.keys(grouped.durations).length,
      other: Object.keys(grouped.other).length,
    },
  };
}
