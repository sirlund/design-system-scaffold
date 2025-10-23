/**
 * Semantic Radius Tokens
 * These tokens define the PUBLIC API for border radius in your design system.
 * They reference primitive tokens and provide intent-based naming.
 *
 * MANUAL CURATION: Edit these to match your design system's needs.
 */

import { primitiveRadius } from '../figma-tokens/radius/radius';

/**
 * Component Radius
 * Border radius values for components
 */
export const componentRadius = {
  // Basic radii
  none: primitiveRadius['radius-0'],
  sm: primitiveRadius['radius-2'],
  md: primitiveRadius['radius-4'],
  lg: primitiveRadius['radius-8'],
  xl: primitiveRadius['radius-12'],
  full: primitiveRadius['radius-9999'],

  // Component-specific radii
  button: primitiveRadius['radius-4'],
  buttonSm: primitiveRadius['radius-2'],
  buttonLg: primitiveRadius['radius-8'],

  input: primitiveRadius['radius-4'],
  card: primitiveRadius['radius-8'],
  modal: primitiveRadius['radius-12'],
  badge: primitiveRadius['radius-9999'],
  avatar: primitiveRadius['radius-9999'],
  chip: primitiveRadius['radius-9999'],
  tooltip: primitiveRadius['radius-4'],
} as const;

export type ComponentRadiusToken = keyof typeof componentRadius;
