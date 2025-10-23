/**
 * Radius Tokens - Auto-generated from Figma
 * Source: imported-from-figma/Shapes.json
 * DO NOT EDIT MANUALLY - Run 'npm run tokens:transform' to regenerate
 */

export const primitiveRadius = {
  'radius-none': '0px', // radius/none
  'radius-2x-small': '6px', // radius/2x/small
  'radius-x-small': '8px', // radius/x/small
  'radius-small': '12px', // radius/small
  'radius-medium': '16px', // radius/medium
  'radius-large': '20px', // radius/large
  'radius-x-large': '24px', // radius/x/large
  'radius-2x-large': '32px', // radius/2x/large
  'radius-full': '999px', // radius/full
} as const;

export type PrimitiveRadiusToken = keyof typeof primitiveRadius;
