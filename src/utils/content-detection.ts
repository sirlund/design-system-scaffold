/**
 * Content Detection Utilities for Storybook
 *
 * Intelligently detects what tokens and components exist
 * to avoid import errors in Storybook stories.
 */

export interface ContentManifest {
  primitiveTokens: {
    colors: boolean;
    spacing: boolean;
    radius: boolean;
    typography: boolean;
  };
  semanticTokens: {
    colors: boolean;
    spacing: boolean;
    radius: boolean;
    typography: boolean;
  };
  components: string[];
}

/**
 * Safely import a module, returning null if it doesn't exist
 */
export async function safeImport<T>(modulePath: string): Promise<T | null> {
  try {
    const module = await import(modulePath);
    return module;
  } catch (error) {
    console.log(`Module not found: ${modulePath}`);
    return null;
  }
}

/**
 * Check if a token module has actual content
 */
export function hasTokenContent(tokenModule: any): boolean {
  if (!tokenModule) return false;

  // Check if any exported object has properties
  const exports = Object.values(tokenModule);
  return exports.some(exp => {
    if (typeof exp === 'object' && exp !== null) {
      return Object.keys(exp).length > 0;
    }
    return false;
  });
}

/**
 * Load primitive colors safely
 */
export async function loadPrimitiveColors() {
  const module = await safeImport('../primitive-tokens/colors/colors');

  if (module && hasTokenContent(module)) {
    // Also load CSS
    await safeImport('../primitive-tokens/colors/colors.css');
    return {
      colors: module.primitiveColors || {},
      hasColors: true,
    };
  }

  return {
    colors: {},
    hasColors: false,
  };
}

/**
 * Load semantic colors safely
 */
export async function loadSemanticColors() {
  const module = await safeImport('../semantic-tokens/colors/colors');

  if (module && hasTokenContent(module)) {
    // Also load CSS
    await safeImport('../semantic-tokens/colors/colors.css');
    return {
      primaryColors: module.primaryColors || {},
      textColors: module.textColors || {},
      brandColors: module.brandColors || {},
      systemColors: module.systemColors || {},
      hasColors: true,
    };
  }

  return {
    primaryColors: {},
    textColors: {},
    brandColors: {},
    systemColors: {},
    hasColors: false,
  };
}

/**
 * Load primitive spacing safely
 */
export async function loadPrimitiveSpacing() {
  const module = await safeImport('../primitive-tokens/spacing/spacing');

  if (module && hasTokenContent(module)) {
    await safeImport('../primitive-tokens/spacing/spacing.css');
    return {
      spacing: module.primitiveSpacing || {},
      hasSpacing: true,
    };
  }

  return {
    spacing: {},
    hasSpacing: false,
  };
}

/**
 * Load primitive radius safely
 */
export async function loadPrimitiveRadius() {
  const module = await safeImport('../primitive-tokens/radius/radius');

  if (module && hasTokenContent(module)) {
    await safeImport('../primitive-tokens/radius/radius.css');
    return {
      radius: module.primitiveRadius || {},
      hasRadius: true,
    };
  }

  return {
    radius: {},
    hasRadius: false,
  };
}

/**
 * Detect all available content
 */
export async function detectAvailableContent(): Promise<ContentManifest> {
  const primitiveColors = await safeImport('../primitive-tokens/colors/colors');
  const primitiveSpacing = await safeImport('../primitive-tokens/spacing/spacing');
  const primitiveRadius = await safeImport('../primitive-tokens/radius/radius');
  const primitiveTypography = await safeImport('../primitive-tokens/typography/typography');

  const semanticColors = await safeImport('../semantic-tokens/colors/colors');
  const semanticSpacing = await safeImport('../semantic-tokens/spacing/spacing');
  const semanticRadius = await safeImport('../semantic-tokens/radius/radius');
  const semanticTypography = await safeImport('../semantic-tokens/typography/typography');

  return {
    primitiveTokens: {
      colors: hasTokenContent(primitiveColors),
      spacing: hasTokenContent(primitiveSpacing),
      radius: hasTokenContent(primitiveRadius),
      typography: hasTokenContent(primitiveTypography),
    },
    semanticTokens: {
      colors: hasTokenContent(semanticColors),
      spacing: hasTokenContent(semanticSpacing),
      radius: hasTokenContent(semanticRadius),
      typography: hasTokenContent(semanticTypography),
    },
    components: [], // TODO: Scan components directory
  };
}
