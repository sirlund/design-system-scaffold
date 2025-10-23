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

// Load configuration
const configPath = path.join(__dirname, '../tokens.config.js');
const configModule = await import(`file://${configPath}`);
const config = configModule.default;

const IMPORTED_DIR = path.join(__dirname, `../${config.inputDir}`);
const PRIMITIVE_OUTPUT_DIR = path.join(__dirname, `../${config.outputDir}`);
const SEMANTIC_OUTPUT_DIR = path.join(__dirname, `../${config.semanticDir}`);

/**
 * Build CSS variable name with appropriate prefix
 * Examples:
 *   buildCSSVar('primitive', 'green-05') → '--primitive-green-05' or '--green-05' if prefix is blank
 *   buildCSSVar('semantic', 'primary-main') → '--primary-main' if semantic prefix is blank
 */
function buildCSSVar(tier, tokenName) {
  const prefix = config.cssPrefix[tier];
  return prefix ? `--${prefix}-${tokenName}` : `--${tokenName}`;
}

/**
 * Classify a token as 'primitive' or 'semantic' based on its name
 * Uses config.classificationRules to determine token type
 */
function classifyToken(tokenName) {
  const { semanticKeywords, primitivePatterns } = config.classificationRules;

  // Check if it matches primitive patterns (e.g., green-05, spacing-16)
  for (const pattern of primitivePatterns) {
    if (pattern.test(tokenName)) {
      return 'primitive';
    }
  }

  // Check if name contains semantic keywords
  const nameLower = tokenName.toLowerCase();
  for (const keyword of semanticKeywords) {
    if (nameLower.includes(keyword)) {
      return 'semantic';
    }
  }

  // Default: if it has numbers at the end, likely primitive, otherwise semantic
  return /[-]?\d+$/.test(tokenName) ? 'primitive' : 'semantic';
}

/**
 * Analyze token to determine if it should be auto-generated as semantic
 * Returns confidence level: 'low', 'medium', 'high', or null
 */
function analyzeSemanticCandidate(tokenName, tokenValue, allTokens) {
  const classification = classifyToken(tokenName);

  if (classification === 'primitive') {
    return null; // Not a semantic candidate
  }

  // Check if it's already a reference (good sign for semantic)
  const isReference = typeof tokenValue === 'string' && tokenValue.match(/^\{.+\}$/);

  // High confidence: has semantic keyword AND is a reference
  if (isReference) {
    return 'high';
  }

  // Medium confidence: has semantic keyword but hardcoded value
  const { semanticKeywords } = config.classificationRules;
  const nameLower = tokenName.toLowerCase();
  const hasSemanticKeyword = semanticKeywords.some(keyword => nameLower.includes(keyword));

  if (hasSemanticKeyword) {
    return 'medium';
  }

  // Low confidence: looks semantic but unclear
  return 'low';
}

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
 * Reorder semantic token names to put category first (industry best practice)
 * Follows patterns from Atlassian, Carbon, etc.
 * Examples:
 * - "primary-black-text" → "text-primary-black"
 * - "secondary-text" → "text-secondary"
 * - "primary-main" → "primary-main" (no change)
 * - "disabled-text" → "text-disabled"
 */
function reorderSemanticToken(tokenName) {
  if (!config.transformations?.reorderSemanticTokens) {
    return tokenName; // Feature disabled
  }

  const keywords = config.transformations.categoryKeywords || [];
  const parts = tokenName.split('-');

  // Find if any category keyword exists in the parts
  for (const keyword of keywords) {
    const keywordIndex = parts.indexOf(keyword);

    if (keywordIndex > 0) {
      // Found keyword not at the start - move it to front
      const removed = parts.splice(keywordIndex, 1);
      parts.unshift(removed[0]);
      return parts.join('-');
    }
  }

  // No reordering needed
  return tokenName;
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
 * Convert hex color to RGB object
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate color distance using simple Euclidean distance
 * Good enough for basic color family matching
 */
function colorDistance(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return Infinity;

  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

/**
 * Find the closest primitive color to a given hex value
 * Returns { name, distance } or null if no close match
 */
function findClosestPrimitive(hexValue, primitiveTokens, maxDistance = 30) {
  let closestName = null;
  let closestDistance = Infinity;

  for (const [name, value] of Object.entries(primitiveTokens)) {
    const distance = colorDistance(hexValue, value);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestName = name;
    }
  }

  // Only return if it's close enough
  if (closestDistance <= maxDistance) {
    return { name: closestName, distance: closestDistance };
  }

  return null;
}

/**
 * Check if a color matches an existing palette (by analyzing similarity to palette colors)
 * Returns true if the color is similar enough to be part of that palette
 */
function matchesExistingPalette(hexValue, paletteFamily, primitiveTokens, threshold = 80) {
  const paletteColors = Object.entries(primitiveTokens)
    .filter(([name]) => name.startsWith(`${paletteFamily}-`))
    .map(([_, value]) => value);

  if (paletteColors.length === 0) return false;

  // Check if the new color is similar to any color in the palette
  for (const paletteColor of paletteColors) {
    const distance = colorDistance(hexValue, paletteColor);
    if (distance < threshold) {
      return true; // Color is similar to this palette
    }
  }

  return false; // Color doesn't match this palette
}

/**
 * Convert RGB to HSL for better color analysis
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  };
}

/**
 * Get creative pure color name based on HSL analysis
 * Returns names like: teal, azure, sky, coral, crimson, amber, etc.
 * NO semantic words allowed (no info-blue, error-red, etc.)
 */
function getPureColorName(hexValues, existingPrimitives) {
  // Analyze the mid-tone color (usually the "main" variant)
  const mainHex = hexValues[Math.floor(hexValues.length / 2)];
  const rgb = hexToRgb(mainHex);
  if (!rgb) return 'unknown';

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const { h, s, l } = hsl;

  // Check if color already exists in primitives
  const usedNames = Object.keys(existingPrimitives)
    .map(name => name.split('-')[0])
    .filter((name, index, self) => self.indexOf(name) === index);

  // Helper to find available name from list
  const findAvailable = (names) => {
    for (const name of names) {
      if (!usedNames.includes(name)) return name;
    }
    // If all used, return first with a number suffix
    return names[0];
  };

  // Pure color naming based on hue ranges
  // Red family (0-15, 345-360)
  if (h < 15 || h >= 345) {
    if (s < 30) return findAvailable(['rose', 'pink', 'blush']);
    if (l > 70) return findAvailable(['coral', 'salmon', 'rose']);
    if (l > 50) return findAvailable(['crimson', 'ruby', 'cherry']);
    return findAvailable(['ruby', 'crimson', 'garnet']);
  }

  // Orange family (15-45)
  if (h >= 15 && h < 45) {
    if (l > 65) return findAvailable(['peach', 'apricot', 'cream']);
    if (s > 70) return findAvailable(['tangerine', 'persimmon', 'tiger']);
    return findAvailable(['amber', 'bronze', 'copper']);
  }

  // Yellow family (45-70)
  if (h >= 45 && h < 70) {
    if (l > 70) return findAvailable(['lemon', 'butter', 'vanilla']);
    if (s > 60) return findAvailable(['gold', 'honey', 'mustard']);
    return findAvailable(['olive', 'khaki', 'sand']);
  }

  // Green family (70-150)
  if (h >= 70 && h < 150) {
    if (l > 70) return findAvailable(['mint', 'sage', 'seafoam']);
    if (h < 100) return findAvailable(['lime', 'chartreuse', 'spring']);
    if (s < 30) return findAvailable(['sage', 'moss', 'olive']);
    if (l > 50) return findAvailable(['emerald', 'jade', 'forest']);
    return findAvailable(['forest', 'hunter', 'pine']);
  }

  // Cyan/Teal family (150-200)
  if (h >= 150 && h < 200) {
    if (l > 70) return findAvailable(['aqua', 'ice', 'frost']);
    if (l > 50) return findAvailable(['teal', 'turquoise', 'cyan']);
    return findAvailable(['ocean', 'deep', 'marine']);
  }

  // Blue family (200-260)
  if (h >= 200 && h < 260) {
    if (l > 70) return findAvailable(['sky', 'powder', 'baby']);
    if (s < 30) return findAvailable(['slate', 'steel', 'pewter']);
    if (l > 60) return findAvailable(['azure', 'cerulean', 'periwinkle']);
    if (l > 40) return findAvailable(['royal', 'sapphire', 'cobalt']);
    return findAvailable(['navy', 'midnight', 'indigo']);
  }

  // Purple/Violet family (260-300)
  if (h >= 260 && h < 300) {
    if (l > 70) return findAvailable(['lavender', 'lilac', 'mauve']);
    if (s < 30) return findAvailable(['plum', 'eggplant', 'wine']);
    if (l > 50) return findAvailable(['violet', 'amethyst', 'orchid']);
    return findAvailable(['purple', 'grape', 'mulberry']);
  }

  // Magenta/Pink family (300-345)
  if (h >= 300 && h < 345) {
    if (l > 70) return findAvailable(['pink', 'rose', 'blush']);
    if (s > 60) return findAvailable(['magenta', 'fuchsia', 'hot']);
    return findAvailable(['berry', 'wine', 'maroon']);
  }

  // Fallback
  return 'unknown';
}

/**
 * Detect scale size from existing palettes
 * Returns 3 for secondary colors (brown, orange, peach, blue, purple, yellow)
 * Returns 10 for primary colors (green, grey)
 */
function detectScaleSize(family, primitiveTokens) {
  // Check existing similar palettes
  const secondaryFamilies = ['brown', 'orange', 'peach', 'blue', 'purple', 'yellow'];
  const primaryFamilies = ['green', 'grey'];

  // Count existing scale for this family
  const existingCount = Object.keys(primitiveTokens)
    .filter(name => name.startsWith(`${family}-`))
    .length;

  if (existingCount > 0) {
    return existingCount; // Use existing scale size
  }

  // Determine based on family type
  if (secondaryFamilies.includes(family)) return 3;
  if (primaryFamilies.includes(family)) return 10;

  // Check if it's a compound name (e.g., 'info-blue', 'success-green')
  for (const secondary of secondaryFamilies) {
    if (family.includes(secondary)) return 3;
  }
  for (const primary of primaryFamilies) {
    if (family.includes(primary)) return 10;
  }

  // Default to 3 for new palettes
  return 3;
}

/**
 * Detect color family from hex value by analyzing RGB components
 * Returns base family name (blue, green, orange, red, etc.)
 */
function detectColorFamily(hexValue, semanticName) {
  const rgb = hexToRgb(hexValue);
  if (!rgb) return null;

  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // Check if it's greyscale (low saturation)
  const saturation = max - min;
  if (saturation < 20) {
    return null; // Let it match to existing grey
  }

  // Detect dominant color component
  const dominantR = r > g && r > b;
  const dominantG = g > r && g > b;
  const dominantB = b > r && b > g;

  // Check semantic name for hints
  const nameLower = semanticName.toLowerCase();

  // Info/Blue family
  if (nameLower.includes('info') || (dominantB && b - r > 50)) {
    return 'blue';
  }

  // Success/Green family
  if (nameLower.includes('success') || (dominantG && !dominantR && !dominantB)) {
    return 'green';
  }

  // Warning/Orange family
  if (nameLower.includes('warning') || (r > 200 && g > 100 && g < 200 && b < 100)) {
    return 'orange';
  }

  // Error/Red/Peach family
  if (nameLower.includes('error') || (dominantR && r - g > 50)) {
    return 'peach';
  }

  // Default: can't determine
  return null;
}

/**
 * Get the next available number in a color family scale
 * For example, if blue-00, blue-01, blue-02 exist, returns 03
 */
function getNextScaleNumber(family, primitiveTokens) {
  const existing = Object.keys(primitiveTokens)
    .filter(name => name.startsWith(`${family}-`))
    .map(name => {
      const match = name.match(new RegExp(`^${family}-(\\d+)$`));
      return match ? parseInt(match[1], 10) : -1;
    })
    .filter(n => n >= 0);

  if (existing.length === 0) return '00';

  const max = Math.max(...existing);
  const next = max + 1;
  return next.toString().padStart(2, '0');
}

/**
 * Extract and group semantic color sets (e.g., Info with main/light/dark)
 * Returns groups like: { Info: [{ name: 'infoMain', value: '#437dcf' }, ...] }
 */
function extractSemanticColorGroups(colorsData) {
  const groups = {};

  function processGroup(groupData, groupPath = []) {
    for (const [key, value] of Object.entries(groupData)) {
      if (value.$value !== undefined) {
        const tokenValue = value.$value;
        const refMatch = tokenValue.match(/^\{(.+)\}$/);

        // Only process hardcoded values (not references)
        if (!refMatch) {
          const parentGroup = groupPath[groupPath.length - 1] || 'Other';
          if (!groups[parentGroup]) {
            groups[parentGroup] = [];
          }
          groups[parentGroup].push({
            name: key,
            value: tokenValue,
            fullPath: [...groupPath, key].join('-')
          });
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recurse into nested groups
        processGroup(value, [...groupPath, key]);
      }
    }
  }

  // Process semantic groups
  const SEMANTIC_GROUPS = ['Text', 'System'];
  for (const group of SEMANTIC_GROUPS) {
    if (colorsData[group]) {
      processGroup(colorsData[group], [group]);
    }
  }

  return groups;
}

/**
 * Sort colors in a group by lightness (light → dark)
 */
function sortByLightness(colorGroup) {
  return colorGroup.sort((a, b) => {
    const rgbA = hexToRgb(a.value);
    const rgbB = hexToRgb(b.value);
    if (!rgbA || !rgbB) return 0;

    const lightnessA = (Math.max(rgbA.r, rgbA.g, rgbA.b) + Math.min(rgbA.r, rgbA.g, rgbA.b)) / 2;
    const lightnessB = (Math.max(rgbB.r, rgbB.g, rgbB.b) + Math.min(rgbB.r, rgbB.g, rgbB.b)) / 2;

    return lightnessB - lightnessA; // Descending (light to dark)
  });
}

/**
 * Extract hardcoded semantic values and generate complete color palettes
 * NEW APPROACH: Groups semantic colors together, assigns creative pure color names,
 * and generates complete 3-level palettes
 */
function extractHardcodedSemanticValues(colorsData, primitiveTokens) {
  const hardcodedPrimitives = {};
  const mappings = {}; // hex value -> primitive name

  // Step 1: Extract semantic color groups
  const semanticGroups = extractSemanticColorGroups(colorsData);

  // Step 2: Process each group
  for (const [groupName, colors] of Object.entries(semanticGroups)) {
    if (colors.length === 0) continue;

    // Try to match all colors to existing primitives first
    const allMatched = colors.every(color => {
      const closest = findClosestPrimitive(color.value, primitiveTokens, 30);
      if (closest) {
        mappings[color.value] = closest.name;
        console.log(`  📍 Mapping ${color.fullPath} (${color.value}) → ${closest.name}`);
        return true;
      }
      return false;
    });

    if (allMatched) continue; // All colors matched, no need to create new palette

    // Step 3: Need to create a new palette for this group
    const hexValues = colors.map(c => c.value);
    const pureColorName = getPureColorName(hexValues, { ...primitiveTokens, ...hardcodedPrimitives });

    console.log(`  🎨 Creating new "${pureColorName}" palette for ${groupName} group (${colors.length} colors)`);

    // Step 4: Sort colors by lightness and generate 3-level palette
    const sortedColors = sortByLightness(colors);

    // Generate palette with proper indices (00, 01, 02)
    sortedColors.forEach((color, index) => {
      const scaleIndex = index.toString().padStart(2, '0');
      const primitiveName = `${pureColorName}-${scaleIndex}`;

      hardcodedPrimitives[primitiveName] = color.value;
      mappings[color.value] = primitiveName;

      console.log(`    → ${primitiveName}: ${color.value} (${color.name})`);
    });
  }

  return { hardcodedPrimitives, mappings };
}

/**
 * Transform Colors.json
 * Processes both PRIMITIVE and SEMANTIC color tokens
 */
function transformColors() {
  console.log('🎨 Transforming Colors...');

  const colorsPath = path.join(IMPORTED_DIR, 'Colors.json');
  const colorsData = JSON.parse(fs.readFileSync(colorsPath, 'utf-8'));

  // Process primitive color groups (pure scales without semantic meaning)
  const PRIMITIVE_COLOR_GROUPS = ['Green', 'Greyscale', 'Secondary', 'Base'];
  const primitiveData = {};

  for (const group of PRIMITIVE_COLOR_GROUPS) {
    if (colorsData[group]) {
      primitiveData[group] = colorsData[group];
    }
  }

  let flatTokens = flattenTokens(primitiveData);

  // Extract hardcoded values from semantic tokens and add them as properly-named primitives
  const { hardcodedPrimitives, mappings } = extractHardcodedSemanticValues(colorsData, flatTokens);
  flatTokens = { ...flatTokens, ...hardcodedPrimitives };

  const primitiveCount = Object.keys(flatTokens).length;
  const hardcodedCount = Object.keys(hardcodedPrimitives).length;

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
    css += `  ${buildCSSVar('primitive', key)}: ${value};\n`;
  }

  css += `}\n`;

  // Write files
  const colorsDir = path.join(PRIMITIVE_OUTPUT_DIR, 'colors');
  fs.mkdirSync(colorsDir, { recursive: true });

  fs.writeFileSync(path.join(colorsDir, 'colors.ts'), ts);
  fs.writeFileSync(path.join(colorsDir, 'colors.css'), css);

  console.log(`  ✅ Generated ${primitiveCount} primitive color tokens`);
  if (hardcodedCount > 0) {
    console.log(`     (includes ${hardcodedCount} primitives created from hardcoded semantic values)`);
  }
  return { primitives: flatTokens, colorsData, mappings };
}

/**
 * Convert Figma reference like "{Green.green05}" to primitive token name "green-05"
 */
function figmaRefToPrimitiveName(ref, primitiveTokens) {
  const match = ref.match(/^\{(.+)\}$/);
  if (!match) return null;

  const [group, token] = match[1].split('.');

  // Try different name conversions to find the primitive
  const candidates = [
    // Direct conversion: Green.green05 → green-05
    `${group.toLowerCase()}-${token.replace(/([A-Z])/g, '-$1').replace(/(\d+)/g, '-$1').toLowerCase()}`.replace(/--+/g, '-'),
    // Simpler: green05 → green-05
    token.replace(/([a-z])(\d)/g, '$1-$2').toLowerCase(),
    // Handle grey vs greyscale
    token.replace(/grey/i, 'grey').replace(/([a-z])(\d)/g, '$1-$2').toLowerCase(),
  ];

  for (const candidate of candidates) {
    if (primitiveTokens[candidate]) {
      return candidate;
    }
  }

  console.warn(`⚠️  Could not resolve reference ${ref} to a primitive token`);
  return null;
}

/**
 * Transform semantic colors - ALL semantic tokens reference primitives
 */
function transformSemanticColors(colorsData, primitiveTokens, mappings = {}) {
  console.log('🎨 Transforming Semantic Colors...');

  const SEMANTIC_GROUPS = ['Primary', 'Text', 'Brand', 'System'];
  const semanticGroups = {};

  // Build a reverse lookup: value -> primitive name (for hardcoded values)
  // Use mappings first (from color family detection), then fallback to primitiveTokens
  const valueToPrimitive = { ...mappings };
  for (const [name, value] of Object.entries(primitiveTokens)) {
    if (!valueToPrimitive[value]) {
      valueToPrimitive[value] = name;
    }
  }

  function processSemanticGroup(groupData, groupName, prefix = '') {
    const result = {};

    for (const [key, value] of Object.entries(groupData)) {
      const currentPath = prefix ? `${prefix}-${key}` : key;
      let cleanedKey = cleanTokenName(key);
      // Apply reordering for best practices (e.g., primary-black-text → text-primary-black)
      cleanedKey = reorderSemanticToken(cleanedKey);

      if (value.$value !== undefined) {
        const tokenValue = value.$value;
        const refMatch = tokenValue.match(/^\{(.+)\}$/);

        if (refMatch) {
          // It's a reference like {Green.green05} - resolve to primitive name
          const primitiveName = figmaRefToPrimitiveName(tokenValue, primitiveTokens);
          if (primitiveName) {
            result[cleanedKey] = primitiveName;
          } else {
            console.warn(`⚠️  Could not resolve reference ${tokenValue}`);
          }
        } else {
          // It's a hardcoded value - find the primitive we created for it
          const primitiveName = valueToPrimitive[tokenValue];
          if (primitiveName) {
            result[cleanedKey] = primitiveName;
          } else {
            console.warn(`⚠️  Hardcoded value ${tokenValue} not found in primitives for ${cleanedKey}`);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        // Nested group (like System.Info)
        const nested = processSemanticGroup(value, groupName, currentPath);
        Object.assign(result, nested);
      }
    }

    return result;
  }

  // Process each semantic group
  for (const group of SEMANTIC_GROUPS) {
    if (colorsData[group]) {
      semanticGroups[group] = processSemanticGroup(colorsData[group], group);
    }
  }

  // Generate TypeScript
  let ts = `/**
 * Semantic Color Tokens - Auto-generated from Figma
 * Source: imported-from-figma/Colors.json
 * DO NOT EDIT MANUALLY - Run 'npm run tokens:transform' to regenerate
 *
 * Semantic tokens represent the intent and purpose of colors in the design system.
 * ALL semantic tokens reference primitive colors - no hardcoded hex values.
 */

import { primitiveColors } from '../../primitive-tokens/colors/colors';

`;

  // Generate each semantic group
  for (const [groupName, tokens] of Object.entries(semanticGroups)) {
    const constName = `${groupName.toLowerCase()}Colors`;

    ts += `export const ${constName} = {\n`;
    for (const [key, primitiveRef] of Object.entries(tokens)) {
      ts += `  '${key}': primitiveColors['${primitiveRef}'],\n`;
    }
    ts += `} as const;\n\n`;
  }

  // Generate union type
  ts += `export type SemanticColorToken = \n`;
  for (const [groupName] of Object.entries(semanticGroups)) {
    const constName = `${groupName.toLowerCase()}Colors`;
    ts += `  | keyof typeof ${constName}\n`;
  }
  ts = ts.trimEnd() + ';\n';

  // Generate CSS
  let css = `/**
 * Semantic Color Tokens - Auto-generated from Figma
 * Source: imported-from-figma/Colors.json
 * DO NOT EDIT MANUALLY - Run 'npm run tokens:transform' to regenerate
 */

:root {
`;

  for (const [groupName, tokens] of Object.entries(semanticGroups)) {
    css += `  /* ${groupName} Colors */\n`;
    for (const [key, primitiveRef] of Object.entries(tokens)) {
      // Use key directly - it already has proper naming from TypeScript generation
      css += `  ${buildCSSVar('semantic', key)}: var(${buildCSSVar('primitive', primitiveRef)});\n`;
    }
    css += `\n`;
  }

  css += `}\n`;

  // Write files
  const semanticColorsDir = path.join(SEMANTIC_OUTPUT_DIR, 'colors');
  fs.mkdirSync(semanticColorsDir, { recursive: true });

  fs.writeFileSync(path.join(semanticColorsDir, 'colors.ts'), ts);
  fs.writeFileSync(path.join(semanticColorsDir, 'colors.css'), css);

  const totalSemanticTokens = Object.values(semanticGroups).reduce((sum, group) => sum + Object.keys(group).length, 0);
  console.log(`  ✅ Generated ${totalSemanticTokens} semantic color tokens (all reference primitives)`);

  return semanticGroups;
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
    css += `  ${buildCSSVar('primitive', key)}: ${value};\n`;
  }

  css += `}\n`;

  // Write files
  const radiusDir = path.join(PRIMITIVE_OUTPUT_DIR, 'radius');
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
    css += `  ${buildCSSVar('primitive', key)}: ${value};\n`;
  }

  css += `\n  /* Size Tokens */\n`;

  for (const [key, value] of Object.entries(sizeTokens)) {
    css += `  ${buildCSSVar('primitive', key)}: ${value};\n`;
  }

  css += `}\n`;

  // Write files
  const spacingDir = path.join(PRIMITIVE_OUTPUT_DIR, 'spacing');
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

  fs.writeFileSync(path.join(PRIMITIVE_OUTPUT_DIR, 'index.ts'), indexTs);
  console.log('  ✅ Generated index.ts');
}

/**
 * Check if semantic tokens exist
 */
function checkSemanticTokens() {
  const semanticColorsPath = path.join(SEMANTIC_OUTPUT_DIR, 'colors/colors.ts');

  // For now, just check if semantic colors exist
  // Later we'll generate these automatically
  const hasSemanticTokens = fs.existsSync(semanticColorsPath);

  return {
    hasSemanticTokens,
  };
}

/**
 * Display semantic tokens guidance
 */
function displaySemanticGuidance(semanticStatus) {
  if (semanticStatus.hasSemanticTokens) {
    console.log('\n✅ Semantic tokens found!');
    console.log('   Location: src/semantic-tokens/');
    return;
  }

  console.log('\n' + '═'.repeat(70));
  console.log('📋 NEXT STEP: Generate Semantic Tokens');
  console.log('═'.repeat(70) + '\n');

  console.log('Semantic tokens will be auto-generated from Figma in the next version.');
  console.log('For now, primitive tokens are ready to use!\n');
}

/**
 * Generate semantic token suggestions report
 * Analyzes all tokens and suggests which ones should be semantic
 */
function generateSemanticSuggestions(colorsData, primitiveTokens) {
  if (!config.semanticSuggestions.enabled) {
    return;
  }

  console.log('💡 Analyzing tokens for semantic suggestions...');

  const suggestions = {
    high: [],
    medium: [],
    low: []
  };

  // Analyze all color groups
  function analyzeGroup(groupData, groupPath = []) {
    for (const [key, value] of Object.entries(groupData)) {
      const currentPath = [...groupPath, key];
      const tokenName = currentPath.join('-').toLowerCase();

      if (value.$value !== undefined) {
        const confidence = analyzeSemanticCandidate(tokenName, value.$value, colorsData);
        if (confidence && confidence >= config.semanticSuggestions.confidenceThreshold) {
          suggestions[confidence].push({
            name: tokenName,
            value: value.$value,
            path: currentPath.join('.'),
            isReference: typeof value.$value === 'string' && value.$value.match(/^\{.+\}$/) !== null
          });
        }
      } else if (typeof value === 'object' && value !== null) {
        analyzeGroup(value, currentPath);
      }
    }
  }

  // Analyze color data
  analyzeGroup(colorsData);

  // Generate markdown report
  let report = `# Semantic Token Suggestions\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `This report suggests which Figma tokens should be classified as semantic tokens.\n`;
  report += `Tokens are categorized by confidence level based on naming conventions and structure.\n\n`;

  report += `## Summary\n\n`;
  report += `- **High Confidence**: ${suggestions.high.length} tokens\n`;
  report += `- **Medium Confidence**: ${suggestions.medium.length} tokens\n`;
  report += `- **Low Confidence**: ${suggestions.low.length} tokens\n\n`;

  // High confidence suggestions
  if (suggestions.high.length > 0) {
    report += `## High Confidence Suggestions\n\n`;
    report += `These tokens have semantic keywords AND reference primitive tokens.\n\n`;
    suggestions.high.forEach(token => {
      report += `- **\`${token.name}\`**\n`;
      report += `  - Path: \`${token.path}\`\n`;
      report += `  - Value: \`${token.value}\`\n`;
      report += `  - Status: ${token.isReference ? '✅ Already references primitive' : '⚠️ Hardcoded value'}\n\n`;
    });
  }

  // Medium confidence suggestions
  if (suggestions.medium.length > 0) {
    report += `## Medium Confidence Suggestions\n\n`;
    report += `These tokens have semantic keywords but use hardcoded values.\n`;
    report += `**Recommendation**: Convert these to reference primitive tokens.\n\n`;
    suggestions.medium.forEach(token => {
      report += `- **\`${token.name}\`**\n`;
      report += `  - Path: \`${token.path}\`\n`;
      report += `  - Value: \`${token.value}\`\n`;
      report += `  - Suggested Action: Find matching primitive or create one\n\n`;
    });
  }

  // Low confidence suggestions
  if (suggestions.low.length > 0) {
    report += `## Low Confidence Suggestions\n\n`;
    report += `These tokens might be semantic but need manual review.\n\n`;
    suggestions.low.forEach(token => {
      report += `- **\`${token.name}\`**\n`;
      report += `  - Path: \`${token.path}\`\n`;
      report += `  - Value: \`${token.value}\`\n\n`;
    });
  }

  // Write report
  const reportPath = path.join(__dirname, '..', config.semanticSuggestions.outputFile);
  const reportDir = path.dirname(reportPath);
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportPath, report);

  console.log(`  ✅ Semantic suggestions report generated: ${config.semanticSuggestions.outputFile}`);
  console.log(`     High: ${suggestions.high.length}, Medium: ${suggestions.medium.length}, Low: ${suggestions.low.length}`);
}

/**
 * Main transformation
 */
function main() {
  console.log('🚀 Transforming Figma Tokens\n');
  console.log('═'.repeat(50) + '\n');

  try {
    // Transform primitives
    const { primitives: colorPrimitives, colorsData, mappings } = transformColors();
    const radius = transformRadius();
    const spacing = transformSpacing();
    generateIndex();

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Primitive tokens transformation complete!');
    console.log('\n📁 Files generated in: src/primitive-tokens/');

    // Transform semantics
    console.log('\n' + '═'.repeat(50) + '\n');
    const semanticColors = transformSemanticColors(colorsData, colorPrimitives, mappings);

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Semantic tokens transformation complete!');
    console.log('\n📁 Files generated in: src/semantic-tokens/');

    // Generate semantic suggestions if enabled
    if (config.generateSemantics === 'suggest') {
      console.log('\n' + '═'.repeat(50) + '\n');
      generateSemanticSuggestions(colorsData, colorPrimitives);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
