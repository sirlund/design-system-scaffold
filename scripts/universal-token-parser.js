/**
 * Universal Token Parser
 *
 * Intelligently detects and transforms ANY design token JSON format
 * into a standardized internal format, then outputs to the project structure.
 *
 * Supports:
 * - W3C Design Tokens Community Group format
 * - Style Dictionary format
 * - Tokens Studio (Figma Tokens) format
 * - Custom/proprietary formats
 * - Simple key-value formats
 *
 * Usage:
 *   node scripts/universal-token-parser.js <input-directory>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION LOADING
// ============================================================================

/**
 * Load and validate tokens.config.js
 * This configuration is MANDATORY for token transformation
 */
async function loadConfig() {
  const configPath = path.resolve(__dirname, '..', 'tokens.config.js');

  if (!fs.existsSync(configPath)) {
    console.error('\n❌ ERROR: tokens.config.js not found!');
    console.error('\nThe tokens.config.js file is required to run the token parser.');
    console.error('It should be located at the root of your project.');
    console.error('\nPlease create tokens.config.js with at minimum:');
    console.error(`
export default {
  cssPrefix: {
    primitive: 'primitive',
    semantic: '',
    component: ''
  }
};
`);
    process.exit(1);
  }

  try {
    const configModule = await import(`file://${configPath}`);
    const config = configModule.default;

    // Validate required settings
    if (!config.cssPrefix) {
      console.error('\n❌ ERROR: tokens.config.js is missing required "cssPrefix" configuration!');
      console.error('\nPlease add the following to your tokens.config.js:');
      console.error(`
cssPrefix: {
  primitive: 'primitive',  // or '' for no prefix
  semantic: '',            // or 'semantic' for --semantic- prefix
  component: ''            // or 'c' for --c- prefix
}
`);
      process.exit(1);
    }

    console.log('✅ Loaded tokens.config.js\n');
    return config;
  } catch (error) {
    console.error('\n❌ ERROR: Failed to load tokens.config.js');
    console.error(error.message);
    process.exit(1);
  }
}

let CONFIG = null;

// ============================================================================
// TOKEN FORMAT DETECTION
// ============================================================================

/**
 * Detects the format of a token file by analyzing its structure
 */
function detectTokenFormat(tokenData, filename) {
  // W3C Design Tokens format
  // Has $type, $value, or {reference} syntax
  if (hasW3CFormat(tokenData)) {
    return {
      format: 'w3c',
      version: detectW3CVersion(tokenData),
      confidence: 'high'
    };
  }

  // Tokens Studio (Figma Tokens) format
  // Has specific structure with $type at top level or nested
  if (hasTokensStudioFormat(tokenData)) {
    return {
      format: 'tokens-studio',
      version: '1.0',
      confidence: 'high'
    };
  }

  // Style Dictionary format
  // Has value, type, and optional attributes
  if (hasStyleDictionaryFormat(tokenData)) {
    return {
      format: 'style-dictionary',
      version: '3.0',
      confidence: 'high'
    };
  }

  // Simple key-value format
  // Just has keys and values (colors, spacing, etc.)
  if (hasSimpleFormat(tokenData)) {
    return {
      format: 'simple',
      category: detectSimpleCategory(tokenData, filename),
      confidence: 'medium'
    };
  }

  // Unknown format - will attempt heuristic parsing
  return {
    format: 'unknown',
    confidence: 'low'
  };
}

function hasW3CFormat(data) {
  const str = JSON.stringify(data);
  // Check for W3C markers: $type, $value, {reference}
  return str.includes('"$type"') ||
         str.includes('"$value"') ||
         /\{[^}]+\}/.test(str.replace(/\{[^{}]*\}/g, ''));
}

function detectW3CVersion(data) {
  // W3C format versions based on spec evolution
  if (data.$schema) return 'draft-spec';
  return '1.0';
}

function hasTokensStudioFormat(data) {
  // Tokens Studio has specific patterns
  const str = JSON.stringify(data);
  return str.includes('"type":"') &&
         (str.includes('"value":') || str.includes('"$value":'));
}

function hasStyleDictionaryFormat(data) {
  // Style Dictionary format has specific structure
  const firstValue = Object.values(data)[0];
  if (typeof firstValue === 'object' && firstValue !== null) {
    return 'value' in firstValue && 'type' in firstValue;
  }
  return false;
}

function hasSimpleFormat(data) {
  // Simple format: just key-value pairs
  const values = Object.values(data);
  return values.every(v =>
    typeof v === 'string' ||
    typeof v === 'number' ||
    (typeof v === 'object' && v !== null && !('$type' in v) && !('type' in v))
  );
}

function detectSimpleCategory(data, filename) {
  const name = filename.toLowerCase();
  const firstKey = Object.keys(data)[0]?.toLowerCase() || '';
  const firstValue = Object.values(data)[0];

  // Detect by filename
  if (name.includes('color')) return 'color';
  if (name.includes('spacing') || name.includes('space')) return 'spacing';
  if (name.includes('typography') || name.includes('font')) return 'typography';
  if (name.includes('radius') || name.includes('border')) return 'radius';
  if (name.includes('shadow') || name.includes('elevation')) return 'shadow';

  // Detect by key names
  if (firstKey.includes('color') || firstKey.includes('bg') || firstKey.includes('text')) return 'color';
  if (firstKey.includes('spacing') || firstKey.includes('gap') || firstKey.includes('margin')) return 'spacing';

  // Detect by value format
  if (typeof firstValue === 'string') {
    if (/^#[0-9A-Fa-f]{6}$/.test(firstValue)) return 'color';
    if (/^\d+px$/.test(firstValue)) return 'spacing';
    if (/^rgba?\(/.test(firstValue)) return 'color';
  }

  return 'unknown';
}

// ============================================================================
// STANDARDIZED TOKEN FORMAT (Internal)
// ============================================================================

/**
 * Standardized internal token format
 * All formats are converted to this before output
 */
class StandardToken {
  constructor(name, value, type, metadata = {}) {
    this.name = name;           // Token name (e.g., "base-red-500")
    this.value = value;         // Resolved value (e.g., "#ef4444")
    this.type = type;           // Token type (color, dimension, etc.)
    this.rawValue = value;      // Original value before resolution
    this.references = null;     // Reference to another token (if any)
    this.metadata = metadata;   // Additional metadata
    this.category = null;       // Category (primitive, semantic)
    this.group = null;          // Group (colors, spacing, etc.)
  }
}

// ============================================================================
// FORMAT-SPECIFIC PARSERS
// ============================================================================

class W3CParser {
  parse(data, filename) {
    const tokens = [];
    this.flattenTokens(data, [], tokens);
    this.resolveReferences(tokens);
    return tokens;
  }

  flattenTokens(obj, path, result) {
    for (const [key, value] of Object.entries(obj)) {
      // Skip $ properties (metadata)
      if (key.startsWith('$')) continue;

      const currentPath = [...path, key];

      // Check if this is a token definition
      if (value && typeof value === 'object' && ('$value' in value || '$type' in value)) {
        // Extract metadata from parentheses before removing them
        const parenthesesContent = [];
        const pathWithMetadata = currentPath.join('-');
        const matches = pathWithMetadata.match(/\(([^)]+)\)/g);
        if (matches) {
          matches.forEach(match => {
            const content = match.slice(1, -1).toLowerCase(); // Remove parens and lowercase
            parenthesesContent.push(content);
          });
        }

        // Detect if this is a legacy/deprecated token
        const isLegacy = parenthesesContent.some(content =>
          content.includes('legacy') ||
          content.includes('deprecated') ||
          content.includes('old')
        );

        // Create token name: join with dashes and convert to kebab-case
        // Remove parentheses and their contents - they're designer notes, not part of token identity
        const tokenName = currentPath
          .join('-')
          .replace(/\([^)]*\)/g, '')  // Remove (legacy), (deprecated), (4px), etc.
          .replace(/_/g, '-')          // Replace underscores with dashes
          .replace(/\s+/g, '-')        // Replace spaces with dashes
          .replace(/[^a-z0-9-]/gi, '') // Remove invalid CSS identifier chars
          .replace(/-+/g, '-')         // Collapse multiple dashes
          .replace(/^-|-$/g, '')       // Trim leading/trailing dashes
          .toLowerCase();               // Convert to lowercase for consistency

        const token = new StandardToken(
          tokenName,
          value.$value,
          value.$type || 'unknown',
          {
            description: value.$description,
            extensions: value.$extensions,
            originalPath: currentPath.join('.'),
            designerNotes: parenthesesContent.length > 0 ? parenthesesContent : undefined,
            isLegacy: isLegacy
          }
        );

        // Check if value is a reference
        if (typeof value.$value === 'string' && /^\{[^}]+\}$/.test(value.$value)) {
          // Extract reference and convert to same format as token names
          token.references = value.$value
            .slice(1, -1)           // Remove braces
            .replace(/\./g, '-')    // Dots to dashes
            .replace(/_/g, '-')     // Underscores to dashes
            .replace(/\([^)]*\)/g, '') // Remove parentheses from references too
            .replace(/\s+/g, '-')   // Spaces to dashes
            .replace(/[^a-z0-9-]/gi, '') // Remove invalid chars
            .replace(/-+/g, '-')    // Collapse dashes
            .replace(/^-|-$/g, '')  // Trim
            .toLowerCase();          // Lowercase for consistency
          token.rawValue = value.$value;
        }

        result.push(token);
      } else if (value && typeof value === 'object') {
        // Recurse into nested structure
        this.flattenTokens(value, currentPath, result);
      }
    }
  }

  resolveReferences(tokens) {
    const tokenMap = new Map(tokens.map(t => [t.name, t]));
    const maxDepth = 10;

    for (const token of tokens) {
      if (token.references) {
        let currentRef = token.references;
        let depth = 0;

        while (currentRef && depth < maxDepth) {
          const refToken = tokenMap.get(currentRef);
          if (!refToken) {
            console.warn(`⚠️  Unresolved reference: ${currentRef} in ${token.name}`);
            break;
          }

          if (!refToken.references) {
            token.value = refToken.value;
            break;
          }

          currentRef = refToken.references;
          depth++;
        }

        if (depth >= maxDepth) {
          console.warn(`⚠️  Circular reference detected: ${token.name}`);
        }
      }
    }
  }
}

class TokensStudioParser {
  parse(data, filename) {
    const tokens = [];
    this.extractTokens(data, [], tokens);
    return tokens;
  }

  extractTokens(obj, path, result) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];

      if (value && typeof value === 'object' && ('value' in value || 'type' in value)) {
        const token = new StandardToken(
          currentPath.join('-').replace(/[^a-zA-Z0-9-]/g, '-'),
          value.value,
          this.normalizeType(value.type),
          {
            description: value.description,
            originalPath: currentPath.join('.')
          }
        );

        result.push(token);
      } else if (value && typeof value === 'object') {
        this.extractTokens(value, currentPath, result);
      }
    }
  }

  normalizeType(type) {
    const typeMap = {
      'color': 'color',
      'sizing': 'dimension',
      'spacing': 'dimension',
      'borderRadius': 'dimension',
      'borderWidth': 'dimension',
      'fontSize': 'dimension',
      'fontFamily': 'fontFamily',
      'fontWeight': 'fontWeight'
    };
    return typeMap[type] || type;
  }
}

class StyleDictionaryParser {
  parse(data, filename) {
    const tokens = [];
    this.extractTokens(data, [], tokens);
    return tokens;
  }

  extractTokens(obj, path, result) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];

      if (value && typeof value === 'object' && 'value' in value) {
        const token = new StandardToken(
          currentPath.join('-').replace(/[^a-zA-Z0-9-]/g, '-'),
          value.value,
          value.type || 'unknown',
          {
            comment: value.comment,
            attributes: value.attributes,
            originalPath: currentPath.join('.')
          }
        );

        result.push(token);
      } else if (value && typeof value === 'object' && !('value' in value)) {
        this.extractTokens(value, currentPath, result);
      }
    }
  }
}

class SimpleParser {
  parse(data, filename, category) {
    const tokens = [];
    this.extractTokens(data, [], tokens, category);
    return tokens;
  }

  extractTokens(obj, path, result, category) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];

      if (typeof value === 'string' || typeof value === 'number') {
        const token = new StandardToken(
          currentPath.join('-').replace(/[^a-zA-Z0-9-]/g, '-'),
          value,
          this.inferType(value, category),
          {
            inferredCategory: category,
            originalPath: currentPath.join('.')
          }
        );

        result.push(token);
      } else if (value && typeof value === 'object') {
        this.extractTokens(value, currentPath, result, category);
      }
    }
  }

  inferType(value, category) {
    if (category === 'color') return 'color';
    if (category === 'spacing') return 'dimension';
    if (category === 'radius') return 'dimension';
    if (category === 'typography') return 'dimension';

    // Infer from value format
    if (typeof value === 'string') {
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) return 'color';
      if (/^\d+px$/.test(value)) return 'dimension';
      if (/^rgba?\(/.test(value)) return 'color';
    }

    return 'unknown';
  }
}

// ============================================================================
// TOKEN CLASSIFICATION
// ============================================================================

function classifyTokens(tokens) {
  const primitives = [];
  const semantics = [];

  for (const token of tokens) {
    // Classify based on naming patterns and references
    if (token.references) {
      // Tokens that reference others are usually semantic
      semantics.push(token);
    } else if (isPrimitivePattern(token.name)) {
      primitives.push(token);
    } else if (isSemanticPattern(token.name)) {
      semantics.push(token);
    } else {
      // Default to primitive if uncertain
      primitives.push(token);
    }
  }

  return { primitives, semantics };
}

function isPrimitivePattern(name) {
  const primitivePrefixes = [
    'base-', 'primitive-', 'scale-', 'color-', 'grey-', 'gray-',
    'red-', 'blue-', 'green-', 'yellow-', 'orange-', 'purple-', 'pink-',
    'spacing-', 'radius-', 'font-size-'
  ];
  return primitivePrefixes.some(prefix => name.toLowerCase().includes(prefix));
}

function isSemanticPattern(name) {
  const semanticPrefixes = [
    'semantic-', 'system-', 'component-',
    'primary-', 'secondary-', 'accent-', 'surface-', 'background-',
    'text-', 'content-', 'border-', 'stroke-'
  ];
  return semanticPrefixes.some(prefix => name.toLowerCase().includes(prefix));
}

// ============================================================================
// OUTPUT GENERATION
// ============================================================================

function groupTokensByType(tokens) {
  const groups = {
    colors: [],
    spacing: [],
    typography: [],
    radius: [],
    shadows: [],
    other: []
  };

  for (const token of tokens) {
    if (token.type === 'color') {
      groups.colors.push(token);
    } else if (token.type === 'dimension') {
      // Further classify dimensions
      const name = token.name.toLowerCase();
      if (name.includes('spacing') || name.includes('gap') || name.includes('scale')) {
        groups.spacing.push(token);
      } else if (name.includes('radius')) {
        groups.radius.push(token);
      } else if (name.includes('font')) {
        groups.typography.push(token);
      } else {
        groups.spacing.push(token); // Default dimensions to spacing
      }
    } else if (token.type === 'shadow') {
      groups.shadows.push(token);
    } else {
      groups.other.push(token);
    }
  }

  return groups;
}

function generateCSSVariables(tokens, prefix = '') {
  let css = '/**\n * Auto-generated CSS Variables\n * DO NOT EDIT MANUALLY\n */\n\n:root {\n';

  for (const token of tokens) {
    // Use prefix from config, handle empty string case
    const varName = prefix ? `--${prefix}-${token.name}` : `--${token.name}`;

    // Handle different value types for CSS
    let cssValue;
    if (typeof token.value === 'string') {
      cssValue = token.value;
    } else if (typeof token.value === 'number') {
      cssValue = token.value;
    } else if (typeof token.value === 'object') {
      // For complex values (shadows, typography), serialize as JSON
      // These typically won't be used directly in CSS but can be consumed by JS
      cssValue = JSON.stringify(token.value);
    } else {
      cssValue = token.value;
    }

    css += `  ${varName}: ${cssValue};\n`;
  }

  css += '}\n';
  return css;
}

function generateTypeScript(tokens, exportName) {
  let ts = '/**\n * Auto-generated TypeScript tokens\n * DO NOT EDIT MANUALLY\n */\n\n';
  ts += `export const ${exportName} = {\n`;

  for (const token of tokens) {
    // Keep token names in kebab-case (no underscore conversion)
    const key = token.name;

    // Handle different value types
    let value;
    if (typeof token.value === 'string') {
      value = `'${token.value}'`;
    } else if (typeof token.value === 'number') {
      value = token.value;
    } else if (typeof token.value === 'object') {
      // Serialize objects/arrays as JSON
      value = JSON.stringify(token.value);
    } else {
      value = token.value;
    }

    ts += `  '${key}': ${value},\n`;
  }

  ts += '} as const;\n';
  return ts;
}

// ============================================================================
// MAIN PARSER
// ============================================================================

export function parseTokenFiles(directory) {
  console.log(`\n🔍 Scanning for token files in: ${directory}\n`);

  const files = fs.readdirSync(directory)
    .filter(f => f.endsWith('.json') && !f.includes('manifest'));

  const allTokens = [];
  const formatStats = {};

  // First pass: Parse all files and extract tokens (without resolving references)
  for (const file of files) {
    console.log(`📄 Processing: ${file}`);

    const filePath = path.join(directory, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Detect format
    const detection = detectTokenFormat(data, file);
    console.log(`   Format: ${detection.format} (confidence: ${detection.confidence})`);

    formatStats[detection.format] = (formatStats[detection.format] || 0) + 1;

    // Parse with appropriate parser (but don't resolve references yet)
    let tokens = [];
    const parser = new W3CParser();

    switch (detection.format) {
      case 'w3c':
        // Extract tokens without resolving references
        parser.flattenTokens(data, [], tokens);
        break;
      case 'tokens-studio':
        tokens = new TokensStudioParser().parse(data, file);
        break;
      case 'style-dictionary':
        tokens = new StyleDictionaryParser().parse(data, file);
        break;
      case 'simple':
        tokens = new SimpleParser().parse(data, file, detection.category);
        break;
      default:
        console.warn(`   ⚠️  Unknown format, attempting heuristic parsing...`);
        tokens = new SimpleParser().parse(data, file, 'unknown');
    }

    console.log(`   ✓ Extracted ${tokens.length} tokens\n`);
    allTokens.push(...tokens);
  }

  // Second pass: Resolve all references across all files
  console.log(`🔗 Resolving cross-file references...\n`);
  new W3CParser().resolveReferences(allTokens);

  // Third pass: Deduplicate tokens (keep last occurrence for each name)
  console.log(`🔍 Deduplicating tokens...\n`);
  const tokenMap = new Map();
  let duplicatesRemoved = 0;

  for (const token of allTokens) {
    if (tokenMap.has(token.name)) {
      duplicatesRemoved++;
    }
    tokenMap.set(token.name, token);
  }

  const dedupedTokens = Array.from(tokenMap.values());

  if (duplicatesRemoved > 0) {
    console.log(`   ⚠️  Removed ${duplicatesRemoved} duplicate token(s)\n`);
  }

  console.log(`\n📊 Format Statistics:`);
  for (const [format, count] of Object.entries(formatStats)) {
    console.log(`   ${format}: ${count} file(s)`);
  }

  console.log(`\n✅ Total tokens extracted: ${dedupedTokens.length} (${allTokens.length} before deduplication)\n`);

  return dedupedTokens;
}

export function transformAndOutput(tokens, outputDir) {
  console.log(`\n🔄 Classifying and organizing tokens...\n`);

  // Separate legacy tokens
  const activeTokens = tokens.filter(t => !t.metadata.isLegacy);
  const legacyTokens = tokens.filter(t => t.metadata.isLegacy);

  console.log(`   Active tokens: ${activeTokens.length}`);
  console.log(`   Legacy tokens: ${legacyTokens.length}`);

  // Classify into primitives and semantics
  const { primitives, semantics } = classifyTokens(activeTokens);
  const { primitives: legacyPrimitives, semantics: legacySemantics } = classifyTokens(legacyTokens);

  console.log(`   - Primitives: ${primitives.length} active, ${legacyPrimitives.length} legacy`);
  console.log(`   - Semantics: ${semantics.length} active, ${legacySemantics.length} legacy`);

  // Group by type
  const primitiveGroups = groupTokensByType(primitives);
  const semanticGroups = groupTokensByType(semantics);
  const legacyPrimitiveGroups = groupTokensByType(legacyPrimitives);
  const legacySemanticGroups = groupTokensByType(legacySemantics);

  console.log(`\n📦 Generating output files...\n`);

  // Generate primitive tokens
  for (const [type, tokens] of Object.entries(primitiveGroups)) {
    if (tokens.length === 0) continue;

    const dir = path.join(outputDir, 'primitive-tokens', type);
    fs.mkdirSync(dir, { recursive: true });

    // CSS - use prefix from config
    const css = generateCSSVariables(tokens, CONFIG.cssPrefix.primitive);
    fs.writeFileSync(path.join(dir, `${type}.css`), css);

    // TypeScript
    const ts = generateTypeScript(tokens, `primitive${capitalize(type)}`);
    fs.writeFileSync(path.join(dir, `${type}.ts`), ts);

    console.log(`   ✓ Generated primitive/${type} (${tokens.length} tokens)`);
  }

  // Generate semantic tokens
  for (const [type, tokens] of Object.entries(semanticGroups)) {
    if (tokens.length === 0) continue;

    const dir = path.join(outputDir, 'semantic-tokens', type);
    fs.mkdirSync(dir, { recursive: true });

    // CSS - use prefix from config
    const css = generateCSSVariables(tokens, CONFIG.cssPrefix.semantic);
    fs.writeFileSync(path.join(dir, `${type}.css`), css);

    // TypeScript
    const ts = generateTypeScript(tokens, `semantic${capitalize(type)}`);
    fs.writeFileSync(path.join(dir, `${type}.ts`), ts);

    console.log(`   ✓ Generated semantic/${type} (${tokens.length} tokens)`);
  }

  // Generate legacy primitive tokens (if any)
  if (legacyTokens.length > 0) {
    console.log(`\n📦 Generating legacy token files...\n`);

    for (const [type, tokens] of Object.entries(legacyPrimitiveGroups)) {
      if (tokens.length === 0) continue;

      const dir = path.join(outputDir, 'primitive-tokens', type);
      fs.mkdirSync(dir, { recursive: true });

      // CSS - use prefix from config, add -legacy suffix
      const css = generateCSSVariables(tokens, CONFIG.cssPrefix.primitive);
      fs.writeFileSync(path.join(dir, `${type}.legacy.css`), css);

      // TypeScript
      const ts = generateTypeScript(tokens, `primitive${capitalize(type)}Legacy`);
      fs.writeFileSync(path.join(dir, `${type}.legacy.ts`), ts);

      console.log(`   ✓ Generated primitive/${type}.legacy (${tokens.length} tokens)`);
    }

    // Generate legacy semantic tokens (if any)
    for (const [type, tokens] of Object.entries(legacySemanticGroups)) {
      if (tokens.length === 0) continue;

      const dir = path.join(outputDir, 'semantic-tokens', type);
      fs.mkdirSync(dir, { recursive: true });

      // CSS - use prefix from config, add -legacy suffix
      const css = generateCSSVariables(tokens, CONFIG.cssPrefix.semantic);
      fs.writeFileSync(path.join(dir, `${type}.legacy.css`), css);

      // TypeScript
      const ts = generateTypeScript(tokens, `semantic${capitalize(type)}Legacy`);
      fs.writeFileSync(path.join(dir, `${type}.legacy.ts`), ts);

      console.log(`   ✓ Generated semantic/${type}.legacy (${tokens.length} tokens)`);
    }
  }

  console.log(`\n✅ Token transformation complete!\n`);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// CLI
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const inputDir = process.argv[2] || 'imported-from-figma';
    const outputDir = 'src';

    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║                                                       ║');
    console.log('║        Universal Design Token Parser v1.0            ║');
    console.log('║                                                       ║');
    console.log('╚═══════════════════════════════════════════════════════╝');

    try {
      // Load config first (required)
      CONFIG = await loadConfig();

      const tokens = parseTokenFiles(inputDir);
      transformAndOutput(tokens, outputDir);

      console.log('🎉 Success! Your tokens are ready to use.\n');
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  })();
}
