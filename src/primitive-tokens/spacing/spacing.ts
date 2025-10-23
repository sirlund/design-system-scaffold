/**
 * Spacing & Size Tokens - Auto-generated from Figma
 * Source: imported-from-figma/Size&Spacing.json
 * DO NOT EDIT MANUALLY - Run 'npm run tokens:transform' to regenerate
 */

export const primitiveSpacing = {
  'space-none': '0px', // space/none
  'space-3x-small': '2px', // space/3x/small
  'space-2x-small': '4px', // space/2x/small
  'space-x-small': '8px', // space/x/small
  'space-small': '12px', // space/small
  'space-medium': '16px', // space/medium
  'space-large': '20px', // space/large
  'space-x-large': '24px', // space/x/large
  'space-2x-large': '32px', // space/2x/large
  'space-3x-large': '48px', // space/3x/large
} as const;

export const primitiveSize = {
  'size-x-small': '12px', // size/x/small
  'size-small': '18px', // size/small
  'size-medium': '20px', // size/medium
  'size-large': '24px', // size/large
  'size-x-large': '32px', // size/x/large
  'size-2x-large': '48px', // size/2x/large
  'size-3x-large': '64px', // size/3x/large
} as const;

export type PrimitiveSpacingToken = keyof typeof primitiveSpacing;
export type PrimitiveSizeToken = keyof typeof primitiveSize;
