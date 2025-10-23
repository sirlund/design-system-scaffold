/**
 * Semantic Spacing Tokens
 * These tokens define the PUBLIC API for spacing in your design system.
 * They reference primitive tokens and provide intent-based naming.
 *
 * MANUAL CURATION: Edit these to match your design system's needs.
 */

import { primitiveSpacing, primitiveSizes } from '../figma-tokens/spacing/spacing';

/**
 * Layout Spacing
 * Spacing for layout-level composition
 */
export const layoutSpacing = {
  pageGutter: primitiveSpacing['spacing-16'],
  sectionGap: primitiveSpacing['spacing-32'],
  containerPadding: primitiveSpacing['spacing-16'],
  gridGap: primitiveSpacing['spacing-16'],
} as const;

/**
 * Component Spacing
 * Spacing within and between components
 */
export const componentSpacing = {
  // Padding
  paddingXs: primitiveSpacing['spacing-4'],
  paddingSm: primitiveSpacing['spacing-8'],
  paddingMd: primitiveSpacing['spacing-12'],
  paddingLg: primitiveSpacing['spacing-16'],
  paddingXl: primitiveSpacing['spacing-24'],

  // Gaps
  gapXs: primitiveSpacing['spacing-4'],
  gapSm: primitiveSpacing['spacing-8'],
  gapMd: primitiveSpacing['spacing-12'],
  gapLg: primitiveSpacing['spacing-16'],
  gapXl: primitiveSpacing['spacing-24'],

  // Margins
  marginXs: primitiveSpacing['spacing-4'],
  marginSm: primitiveSpacing['spacing-8'],
  marginMd: primitiveSpacing['spacing-12'],
  marginLg: primitiveSpacing['spacing-16'],
  marginXl: primitiveSpacing['spacing-24'],
} as const;

/**
 * Element Spacing
 * Fine-grained spacing for elements
 */
export const elementSpacing = {
  iconGap: primitiveSpacing['spacing-8'],
  labelGap: primitiveSpacing['spacing-4'],
  inlineGap: primitiveSpacing['spacing-4'],
  stackGap: primitiveSpacing['spacing-8'],
} as const;

/**
 * Component Sizes
 * Sizes for interactive components
 */
export const componentSizes = {
  // Button heights
  buttonSm: primitiveSizes['size-32'],
  buttonMd: primitiveSizes['size-40'],
  buttonLg: primitiveSizes['size-48'],

  // Input heights
  inputSm: primitiveSizes['size-32'],
  inputMd: primitiveSizes['size-40'],
  inputLg: primitiveSizes['size-48'],

  // Icon sizes
  iconXs: primitiveSizes['size-16'],
  iconSm: primitiveSizes['size-20'],
  iconMd: primitiveSizes['size-24'],
  iconLg: primitiveSizes['size-32'],
  iconXl: primitiveSizes['size-40'],

  // Avatar sizes
  avatarSm: primitiveSizes['size-32'],
  avatarMd: primitiveSizes['size-40'],
  avatarLg: primitiveSizes['size-48'],
  avatarXl: primitiveSizes['size-64'],
} as const;

export type LayoutSpacingToken = keyof typeof layoutSpacing;
export type ComponentSpacingToken = keyof typeof componentSpacing;
export type ElementSpacingToken = keyof typeof elementSpacing;
export type ComponentSizeToken = keyof typeof componentSizes;
