/**
 * Design System Scaffold Configuration
 *
 * This file controls how your design system is generated from Figma.
 * Edit this file to customize token transformation, naming conventions,
 * and semantic token generation for YOUR design system.
 */

export default {
  // ============================================================================
  // Project Identity
  // ============================================================================

  projectName: 'MyDesignSystem',

  // ============================================================================
  // CSS Variable Prefixes (ACTIVE - used by transform script)
  // ============================================================================

  // Define prefixes for each token tier
  // Examples:
  //   primitivePrefix: 'primitive' → --primitive-green-05
  //   primitivePrefix: '' → --green-05
  //   semanticPrefix: 'ds' → --ds-primary-main
  //   componentPrefix: 'c' → --c-button-bg

  cssPrefix: {
    primitive: 'primitive',  // Prefix for primitive tokens (can be blank '')
    semantic: '',            // Prefix for semantic tokens (blank = no prefix)
    component: '',           // Prefix for component tokens (blank = no prefix)
  },

  // ============================================================================
  // Input/Output Directories (ACTIVE - used by transform script)
  // ============================================================================

  inputDir: './imported-from-figma',     // Where you place Figma JSON exports
  outputDir: './src/primitive-tokens',   // Where primitive tokens are generated
  semanticDir: './src/semantic-tokens',  // Where semantic tokens are generated

  // ============================================================================
  // Semantic Token Generation (ACTIVE - used by transform script)
  // ============================================================================

  // Controls how semantic tokens are generated:
  // - false: Manual curation only (you create semantic tokens by hand)
  // - 'suggest': Agent suggests semantics, you review and approve (generates report)
  // - true: Full auto-generation (future feature)
  generateSemantics: 'suggest',

  // ============================================================================
  // Semantic Suggestions (ACTIVE - used by transform script)
  // ============================================================================

  semanticSuggestions: {
    enabled: true,
    outputFile: '.claude/reports/semantic-suggestions.md',
    confidenceThreshold: 'medium',  // 'low' | 'medium' | 'high'
  },

  // ============================================================================
  // Token Classification Rules (ACTIVE - used by transform script)
  // ============================================================================

  classificationRules: {
    // Keywords that indicate a token is semantic (intent-based)
    semanticKeywords: [
      // Brand & Identity
      'primary', 'secondary', 'tertiary', 'brand', 'accent',

      // Interaction States
      'action', 'interactive', 'hover', 'active', 'focus',
      'disabled', 'pressed', 'selected',

      // Feedback & Status
      'success', 'error', 'warning', 'info', 'danger',
      'positive', 'negative', 'neutral',

      // UI Layers
      'background', 'surface', 'foreground', 'text', 'border',
      'overlay', 'backdrop', 'shadow',

      // Component-specific
      'button', 'input', 'card', 'modal', 'badge', 'tag',
      'nav', 'header', 'footer', 'sidebar',
    ],

    // Patterns that indicate a token is primitive (scale-based)
    primitivePatterns: [
      /^[a-z]+-\d{2,3}$/,              // green-100, blue-500
      /^[a-z]+-[a-z]+\d{2}$/,          // green-green01
      /^spacing-\d+$/,                 // spacing-4, spacing-16
      /^radius-\d+$/,                  // radius-8, radius-12
      /^font-size-\d+$/,               // font-size-16
      /^line-height-\d+$/,             // line-height-24
      /^(white|black|transparent)$/,   // Base colors
    ],
  },

  // ============================================================================
  // Name Transformations (PARTIALLY ACTIVE - reorderSemanticTokens implemented)
  // ============================================================================

  transformations: {
    // Remove redundant prefixes from Figma exports (INACTIVE)
    // Example: "Green-green01" → "green-01"
    removeRedundantPrefixes: true,

    // Reorder semantic tokens to put category first (ACTIVE)
    // Follows industry best practices from Atlassian, Carbon, etc.
    // Examples:
    //   primary-black-text → text-primary-black
    //   secondary-text → text-secondary
    //   primary-main → primary-main (no change)
    reorderSemanticTokens: true,

    // Keywords that should be moved to the front when found (ACTIVE)
    categoryKeywords: ['text', 'background', 'border', 'surface', 'icon'],

    // Manual name mappings for edge cases (INACTIVE)
    nameMap: {
      // 'Figma-name': 'output-name',
      // Example: 'Base-black': 'base-black'
    },

    // Case format for generated tokens (INACTIVE)
    caseFormat: {
      primitives: 'camelCase',  // 'kebab-case' | 'camelCase' | 'PascalCase'
      semantics: 'kebab-case',
    },
  },

  // ============================================================================
  // Output Templates (INACTIVE - not yet implemented)
  // ============================================================================

  templates: [
    {
      type: 'primitive',
      category: 'colors',
      destination: 'colors/primitives.ts',
      format: 'typescript/es6-const',
      cssDestination: 'colors/primitives.css',
      cssPrefix: '--primitive-',
    },
    {
      type: 'primitive',
      category: 'spacing',
      destination: 'spacing/primitives.ts',
      format: 'typescript/es6-const',
      cssDestination: 'spacing/primitives.css',
      cssPrefix: '--spacing-',
    },
    {
      type: 'primitive',
      category: 'radius',
      destination: 'radius/primitives.ts',
      format: 'typescript/es6-const',
      cssDestination: 'radius/primitives.css',
      cssPrefix: '--radius-',
    },
    {
      type: 'primitive',
      category: 'typography',
      destination: 'typography/primitives.ts',
      format: 'typescript/es6-const',
      cssDestination: 'typography/primitives.css',
      cssPrefix: '--font-',
    },
  ],

  // ============================================================================
  // Quality Audit (INACTIVE - not yet implemented)
  // ============================================================================

  audit: {
    checks: {
      hardcodedValues: true,           // Find hardcoded colors/spacing in components
      brokenReferences: true,          // Find broken token references
      namingConventions: true,         // Check naming consistency
      primitiveUsageInComponents: true, // Warn about primitives in components
    },
    reportDir: './.claude/reports',
    reportFormat: 'markdown',
  },

  // ============================================================================
  // Validation Rules (INACTIVE - not yet implemented)
  // ============================================================================

  validation: {
    // Fail transformation if these issues are found
    failOn: {
      brokenReferences: true,
      invalidTokenFormat: true,
    },

    // Warn but don't fail
    warnOn: {
      hardcodedValues: true,
      primitiveUsageInComponents: true,
    },
  },
};
