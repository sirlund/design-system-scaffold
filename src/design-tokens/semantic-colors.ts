/**
 * Semantic Color Tokens
 * These tokens define the PUBLIC API for your design system.
 * They reference primitive tokens and provide intent-based naming.
 *
 * MANUAL CURATION: Edit these to match your design system's needs.
 */

import { primitiveColors } from '../figma-tokens/colors/colors';

/**
 * Brand Colors
 * Core brand identity colors
 */
export const brandColors = {
  primary: primitiveColors['green-06'],
  primaryLight: primitiveColors['green-03'],
  primaryDark: primitiveColors['green-08'],
  secondary: primitiveColors['blue-02'],
  secondaryLight: primitiveColors['blue-01'],
  secondaryDark: primitiveColors['blue-02'],
} as const;

/**
 * Component Colors
 * Colors for interactive elements
 */
export const componentColors = {
  // Buttons
  buttonPrimary: primitiveColors['green-06'],
  buttonPrimaryHover: primitiveColors['green-07'],
  buttonPrimaryActive: primitiveColors['green-08'],
  buttonPrimaryDisabled: primitiveColors['grey-04'],

  buttonSecondary: primitiveColors['blue-02'],
  buttonSecondaryHover: primitiveColors['blue-01'],
  buttonSecondaryActive: primitiveColors['blue-02'],

  // Inputs
  inputBorder: primitiveColors['grey-04'],
  inputBorderFocus: primitiveColors['green-06'],
  inputBorderError: primitiveColors['peach-02'],
  inputBackground: primitiveColors['base-white'],
  inputBackgroundDisabled: primitiveColors['grey-02'],

  // Links
  linkDefault: primitiveColors['blue-02'],
  linkHover: primitiveColors['blue-01'],
  linkVisited: primitiveColors['purple-02'],
} as const;

/**
 * Feedback Colors
 * Colors for status and feedback messages
 */
export const feedbackColors = {
  success: primitiveColors['green-07'],
  successLight: primitiveColors['green-02'],
  successDark: primitiveColors['green-09'],

  error: primitiveColors['peach-02'],
  errorLight: primitiveColors['peach-00'],
  errorDark: primitiveColors['peach-02'],

  warning: primitiveColors['yellow-02'],
  warningLight: primitiveColors['yellow-00'],
  warningDark: primitiveColors['yellow-02'],

  info: primitiveColors['blue-02'],
  infoLight: primitiveColors['blue-00'],
  infoDark: primitiveColors['blue-02'],
} as const;

/**
 * Surface Colors
 * Colors for backgrounds and surfaces
 */
export const surfaceColors = {
  background: primitiveColors['base-white'],
  backgroundAlt: primitiveColors['grey-01'],
  backgroundElevated: primitiveColors['base-white'],

  surface: primitiveColors['base-white'],
  surfaceAlt: primitiveColors['grey-02'],
  surfaceHover: primitiveColors['grey-01'],

  overlay: primitiveColors['grey-10'], // Use with opacity
  divider: primitiveColors['grey-04'],
} as const;

/**
 * Text Colors
 * Colors for typography
 */
export const textColors = {
  primary: primitiveColors['grey-10'],
  secondary: primitiveColors['grey-07'],
  tertiary: primitiveColors['grey-06'],
  disabled: primitiveColors['grey-05'],
  inverse: primitiveColors['base-white'],

  onPrimary: primitiveColors['base-white'], // Text on primary color
  onSecondary: primitiveColors['base-white'], // Text on secondary color
  onSuccess: primitiveColors['base-white'],
  onError: primitiveColors['base-white'],
} as const;

/**
 * Border Colors
 * Colors for borders and dividers
 */
export const borderColors = {
  default: primitiveColors['grey-04'],
  subtle: primitiveColors['grey-03'],
  strong: primitiveColors['grey-06'],
  focus: primitiveColors['green-06'],
  error: primitiveColors['peach-02'],
} as const;

export type BrandColorToken = keyof typeof brandColors;
export type ComponentColorToken = keyof typeof componentColors;
export type FeedbackColorToken = keyof typeof feedbackColors;
export type SurfaceColorToken = keyof typeof surfaceColors;
export type TextColorToken = keyof typeof textColors;
export type BorderColorToken = keyof typeof borderColors;
