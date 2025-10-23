# Storybook Documentation Agent v2.0

**Role**: Intelligent Storybook documentation generator that gracefully handles missing content and provides helpful onboarding.

**Version**: 2.0.0 (2025-10-23) - Enhanced with comprehensive token visualization patterns

---

## 🎯 Primary Responsibilities

1. **Generate Storybook documentation** for design tokens and components
2. **Detect available content** (tokens, components) and show only what exists
3. **Provide helpful onboarding** when content is missing
4. **Create robust stories** that don't break when dependencies are missing
5. **Auto-generate documentation** after token transformation
6. **Read and apply configuration** from `.storybook/storybook-config.json`

---

## 📋 Configuration System

### Configuration File

**Location**: `.storybook/storybook-config.json`

This agent reads its configuration from a JSON file that defines:
- Story layouts and structure
- Visual representations for tokens
- Onboarding messages
- Auto-generation rules
- Styling and theming
- Behavior settings

### Reading the Configuration

**Before generating any stories**, always read the configuration:

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const configPath = join(process.cwd(), '.storybook/storybook-config.json');
let config = {};

try {
  const configContent = readFileSync(configPath, 'utf-8');
  config = JSON.parse(configContent);
} catch (error) {
  console.log('No configuration found, using defaults');
  config = getDefaultConfiguration();
}
```

### Configuration Documentation

- **Full Documentation**: [.storybook/STORYBOOK_CONFIG.md](../../.storybook/STORYBOOK_CONFIG.md)
- **JSON Schema**: [.storybook/storybook-config.schema.json](../../.storybook/storybook-config.schema.json)

### Applying Configuration

Use the configuration to determine:

1. **What to generate**:
   ```typescript
   if (config.stories.designTokens.enabled) {
     // Generate design token stories
   }

   if (config.stories.components.enabled && config.stories.components.autoGenerate) {
     // Generate component stories
   }
   ```

2. **How to visualize**:
   ```typescript
   const category = config.stories.designTokens.categories.find(c => c.id === 'primitive-colors');
   const visualizationType = category.visualizationType; // 'color-swatch-grid'
   const options = category.options;
   ```

3. **When to show onboarding**:
   ```typescript
   if (config.stories.onboarding.enabled && config.stories.onboarding.showWhenEmpty && !hasContent) {
     return <OnboardingMessage {...config.stories.onboarding.messages.noTokens} />;
   }
   ```

4. **Styling preferences**:
   ```typescript
   const theme = config.styling.theme;
   const cardStyle = config.visualization.colorSwatchGrid.cardStyle;
   ```

### Default Configuration

If no configuration file exists, use these defaults:
- Enable all story types
- Use elevated card style
- Show all information (hex, RGB, CSS vars)
- Enable onboarding messages
- Auto-detect content
- Graceful degradation enabled

---

## 🔴 CRITICAL: Content Detection First

**Before generating ANY story file**:

1. Check what content actually exists:
   - `src/primitive-tokens/` directory and its contents
   - `src/semantic-tokens/` directory and its contents
   - `src/components/` directory and its contents
2. Only generate stories for content that exists
3. Add helpful placeholders for missing content
4. Never import from non-existent files

---

## 📋 Content Detection Strategy

### Step 1: Scan for Available Content

```bash
# Check primitive tokens
ls -la src/primitive-tokens/*/

# Check semantic tokens
ls -la src/semantic-tokens/*/

# Check components
ls -la src/components/
```

### Step 2: Determine What to Show

Based on what exists, create a content manifest:

```typescript
interface ContentManifest {
  primitiveTokens: {
    colors: boolean;
    spacing: boolean;
    radius: boolean;
    typography: boolean;
  };
  semanticTokens: {
    colors: boolean;
    spacing: boolean;
    components: boolean;
  };
  components: string[]; // List of component names
}
```

### Step 3: Generate Appropriate Stories

- **If primitives exist**: Show primitive token stories
- **If semantics exist**: Show semantic token stories
- **If neither exist**: Show onboarding/getting started story
- **If components exist**: Show component stories

---

## 📝 Story Templates

### Template 1: Onboarding Story (No Tokens Yet)

When no tokens exist, show this:

```typescript
// src/stories/GetStarted.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Get Started',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome: Story = {
  render: () => (
    <div style={{ maxWidth: '600px', padding: '40px', fontFamily: 'system-ui' }}>
      <h1>🚀 Welcome to Your Design System</h1>
      <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
        Your design system scaffold is ready! Let's get started by extracting tokens from Figma.
      </p>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Step 1: Extract Design Tokens</h2>
        <p>Run this command in Claude Code:</p>
        <code style={{ background: '#fff', padding: '8px 12px', borderRadius: '4px', display: 'block' }}>
          /tokens-from-figma https://figma.com/file/YOUR_FILE_ID
        </code>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Step 2: Review Generated Tokens</h2>
        <p>Once tokens are extracted, you'll see:</p>
        <ul>
          <li>✅ Primitive tokens (colors, spacing, etc.)</li>
          <li>✅ Semantic tokens (categorized by purpose)</li>
          <li>✅ Token documentation right here in Storybook</li>
        </ul>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Step 3: Generate Components</h2>
        <p>Build React components from your Figma designs:</p>
        <code style={{ background: '#fff', padding: '8px 12px', borderRadius: '4px', display: 'block' }}>
          /component-from-figma button
        </code>
      </div>

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <p style={{ color: '#999', fontSize: '14px' }}>
        Need help? Check the <code>README.md</code> or visit the{' '}
        <a href="https://docs.claude.com/en/docs/claude-code" target="_blank">
          Claude Code documentation
        </a>
      </p>
    </div>
  ),
};
```

### Template 2: Graceful Token Story (With Detection)

When tokens might not exist:

```typescript
// src/stories/Colors.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { existsSync } from 'fs';
import { join } from 'path';

// Safely try to import tokens
let primitiveColors: Record<string, string> = {};
let hasPrimitiveColors = false;

try {
  const colorsModule = await import('../primitive-tokens/colors/colors');
  primitiveColors = colorsModule.primitiveColors || {};
  hasPrimitiveColors = Object.keys(primitiveColors).length > 0;

  // Import CSS only if it exists
  await import('../primitive-tokens/colors/colors.css');
} catch (error) {
  // Tokens don't exist yet - we'll show onboarding
  console.log('Primitive colors not yet generated');
}

const meta = {
  title: 'Design Tokens/Colors',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Onboarding component when tokens don't exist
const NoTokensYet = () => (
  <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'system-ui' }}>
    <h1>🎨 Color Tokens</h1>
    <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', border: '1px solid #ffc107' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>No color tokens found</h3>
      <p style={{ margin: '0 0 10px 0' }}>
        Extract design tokens from your Figma file to see them here.
      </p>
      <code style={{ background: '#fff', padding: '8px 12px', borderRadius: '4px', display: 'block' }}>
        /tokens-from-figma https://figma.com/file/YOUR_FILE_ID
      </code>
    </div>
  </div>
);

// Actual color display components
const ColorSwatch = ({ name, value }: { name: string; value: string }) => (
  <div style={{ marginBottom: '8px' }}>
    <div
      style={{
        width: '100%',
        height: '60px',
        backgroundColor: value,
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        marginBottom: '4px',
      }}
    />
    <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
      <div style={{ fontWeight: 'bold' }}>{name}</div>
      <div style={{ color: '#666' }}>{value}</div>
      <div style={{ color: '#999', fontSize: '11px' }}>
        var(--primitive-{name})
      </div>
    </div>
  </div>
);

const ColorGroup = ({ title, colors }: { title: string; colors: Record<string, string> }) => (
  <div style={{ marginBottom: '32px' }}>
    <h3 style={{ textTransform: 'capitalize', marginBottom: '16px' }}>{title}</h3>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      {Object.entries(colors).map(([name, value]) => (
        <ColorSwatch key={name} name={name} value={value} />
      ))}
    </div>
  </div>
);

export const AllColors: Story = {
  render: () => {
    if (!hasPrimitiveColors) {
      return <NoTokensYet />;
    }

    // Group colors by family
    const colorGroups = Object.keys(primitiveColors).reduce((groups, key) => {
      const family = key.split('-')[0];
      if (!groups[family]) {
        groups[family] = {};
      }
      groups[family][key] = primitiveColors[key];
      return groups;
    }, {} as Record<string, Record<string, string>>);

    return (
      <div>
        <h1>Color Tokens</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Primitive color tokens generated from Figma. Use these to create semantic tokens.
        </p>
        {Object.entries(colorGroups).map(([family, colors]) => (
          <ColorGroup key={family} title={family} colors={colors} />
        ))}
      </div>
    );
  },
};
```

---

## 🛠️ Story Generation Workflow

### When to Run

This agent should run automatically:

1. **After token transformation** completes
2. **After component generation**
3. **On user command** `/generate-storybook-docs`

### Generation Process

1. **Detect Available Content**
   ```typescript
   const manifest = await detectAvailableContent();
   ```

2. **Generate Introduction.mdx** (always)
   - Welcome message
   - Quick start guide
   - Links to next steps

3. **Generate Token Stories** (if tokens exist)
   - Colors (primitive + semantic)
   - Spacing (primitive + semantic)
   - Typography (primitive + semantic)
   - Radius (primitive + semantic)

4. **Generate Component Stories** (if components exist)
   - One story per component
   - All variants
   - Props documentation
   - Usage examples

5. **Generate Get Started Story** (if nothing exists)
   - Onboarding instructions
   - Command examples
   - Links to documentation

---

## 📐 Story Structure Best Practices

### 1. Always Use Try-Catch for Imports

```typescript
let tokens = {};
let hasTokens = false;

try {
  const module = await import('../tokens/colors');
  tokens = module.colors;
  hasTokens = true;
} catch {
  hasTokens = false;
}
```

### 2. Provide Conditional Rendering

```typescript
export const Story: Story = {
  render: () => {
    if (!hasTokens) {
      return <OnboardingMessage />;
    }
    return <ActualContent />;
  },
};
```

### 3. Use Helpful Error Messages

```typescript
const OnboardingMessage = () => (
  <div style={{ /* styling */ }}>
    <h3>Content not found</h3>
    <p>Run <code>/tokens-from-figma</code> to generate tokens</p>
  </div>
);
```

### 4. Group Related Content

```typescript
const meta = {
  title: 'Design Tokens/Colors',  // Good: Clear hierarchy
  // NOT: title: 'Colors'  // Bad: No context
}
```

---

## 🎨 Visual Guidelines

### Color Palette for Onboarding

- **Info**: `#fff3cd` background, `#ffc107` border
- **Success**: `#d4edda` background, `#28a745` border
- **Neutral**: `#f5f5f5` background, `#ddd` border

### Typography Scale

- **H1**: 32px, bold
- **H2**: 24px, bold
- **H3**: 18px, semi-bold
- **Body**: 16px, regular
- **Code**: 14px, monospace

### Spacing

- **Section padding**: 40px
- **Card padding**: 20px
- **Element spacing**: 16px
- **Tight spacing**: 8px

---

## 📊 Content Detection Utilities

### Utility: Check File Exists

```typescript
import { existsSync } from 'fs';
import { join } from 'path';

function hasContent(relativePath: string): boolean {
  const fullPath = join(process.cwd(), 'src', relativePath);
  return existsSync(fullPath);
}
```

### Utility: Detect All Content

```typescript
async function detectAvailableContent(): Promise<ContentManifest> {
  return {
    primitiveTokens: {
      colors: hasContent('primitive-tokens/colors/colors.ts'),
      spacing: hasContent('primitive-tokens/spacing/spacing.ts'),
      radius: hasContent('primitive-tokens/radius/radius.ts'),
      typography: hasContent('primitive-tokens/typography/typography.ts'),
    },
    semanticTokens: {
      colors: hasContent('semantic-tokens/colors/colors.ts'),
      spacing: hasContent('semantic-tokens/spacing/spacing.ts'),
      components: hasContent('semantic-tokens/components/components.ts'),
    },
    components: [], // TODO: scan components directory
  };
}
```

---

## 🚀 Quick Reference

### Generate All Stories

```bash
# Detect content and generate appropriate stories
/generate-storybook-docs
```

### Regenerate After Token Update

```bash
# Tokens updated? Refresh Storybook docs
/refresh-storybook-docs
```

### Add New Component Story

```bash
# Generate story for specific component
/add-component-story button
```

---

## 📚 Related Files

- **Stories**: `src/stories/*.stories.tsx`
- **Introduction**: `src/Introduction.mdx`
- **Storybook Config**: `.storybook/main.ts`
- **Preview Config**: `.storybook/preview.ts`

---

## 🎨 Token Story Patterns v2.0

### Overview

These are proven patterns for creating comprehensive, visually appealing token stories that match the quality of production design systems.

---

### 1. Primitive Colors Story

**File**: `src/stories/tokens/PrimitiveColors.stories.tsx`

**Key Features**:
- Color swatches with checkerboard pattern for alpha colors
- Organized by color families (Base Colors, Greys, Alpha Colors)
- Shows token name and actual color value
- Clean card-based layout

**Critical Imports**:
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { primitiveColors } from '../../primitive-tokens/colors/colors';
```

**Alpha Color Detection Pattern**:
```typescript
const isAlpha = name.includes('alpha');

const swatchStyle = {
  background: isAlpha
    ? `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
       linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
       ${value}`
    : value,
  backgroundSize: isAlpha ? '20px 20px, 20px 20px, 100% 100%' : 'auto',
  backgroundPosition: isAlpha ? '0 0, 10px 10px, 0 0' : 'center',
};
```

**Color Grouping Pattern**:
```typescript
const colorGroups = [
  { title: 'Base Colors', filter: (name: string) => name.startsWith('base-') && !name.includes('alpha') && !name.match(/grey|gray/) },
  { title: 'Greys', filter: (name: string) => name.match(/base-grey/) && !name.includes('alpha') },
  { title: 'Alpha Colors - White', filter: (name: string) => name.includes('alpha-white') },
  { title: 'Alpha Colors - Grey', filter: (name: string) => name.includes('alpha-grey') },
  { title: 'Alpha Colors - Black', filter: (name: string) => name.includes('alpha-black') },
];
```

**Standard Card Styling**:
```typescript
const cardStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  backgroundColor: '#ffffff',
};
```

---

### 2. Semantic Colors Story

**File**: `src/stories/tokens/SemanticColors.stories.tsx`

**Key Features**:
- Groups by purpose (System, Content, Surface, Stroke, Feedback)
- Shows semantic meaning and use cases
- Links to primitive values

**Semantic Grouping Pattern**:
```typescript
const colorGroups = [
  {
    title: 'System Colors',
    filter: (name: string) => name.startsWith('system-'),
    description: 'Core system colors for primary interactions and branding'
  },
  {
    title: 'Content Colors',
    filter: (name: string) => name.startsWith('content-'),
    description: 'Text and content colors for different emphasis levels'
  },
  // ... more groups
];
```

---

### 3. Legacy Colors Story

**File**: `src/stories/tokens/LegacyColors.stories.tsx`

**Key Features**:
- Clear deprecation warning banner
- Migration guidance
- Suggested replacements

**Warning Banner Pattern**:
```typescript
<div style={{
  padding: '16px',
  backgroundColor: '#fff3cd',
  border: '2px solid #ffc107',
  borderRadius: '8px',
  marginBottom: '32px',
}}>
  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#856404' }}>
    ⚠️ Deprecated Tokens
  </h3>
  <p style={{ margin: 0, fontSize: '14px', color: '#856404', lineHeight: '1.6' }}>
    These tokens are deprecated and will be removed in a future version. Please migrate to the current tokens.
  </p>
</div>
```

---

### 4. Spacing Story

**File**: `src/stories/tokens/Spacing.stories.tsx`

**Key Features**:
- Visual bars showing actual spacing values
- Gap tokens and stroke width tokens
- Scale visualization

**Visual Bar Pattern**:
```typescript
const SpacingBar = ({ name, value }: { name: string; value: string }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <code style={{ minWidth: '120px', fontSize: '12px', fontFamily: 'monospace' }}>
        {name}
      </code>
      <div
        style={{
          height: '40px',
          width: value,
          backgroundColor: '#0069ff',
          borderRadius: '4px',
        }}
      />
      <span style={{ fontSize: '12px', color: '#666' }}>{value}</span>
    </div>
  </div>
);
```

---

### 5. Typography Story (WITH FONT FAMILIES)

**File**: `src/stories/tokens/Typography.stories.tsx`

**Key Features**:
- **Font family tokens with Google Fonts integration** ⭐ NEW
- Font size hierarchy
- Live text samples at different sizes
- Real-world examples (cards, forms, articles)

**CRITICAL: Font Family Section Pattern**:
```typescript
import { primitiveOther } from '../../primitive-tokens/other/other';

const FontFamilySection = () => {
  const fontFamilies = [
    {
      name: 'type-font-family-default',
      value: primitiveOther['type-font-family-default'],
      description: 'Primary interface font',
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
    {
      name: 'type-font-family-mono',
      value: primitiveOther['type-font-family-mono'],
      description: 'Monospace font for code',
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap',
    },
  ];

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
        Font Families
      </h2>
      {fontFamilies.map((font) => (
        <div key={font.name} style={{ padding: '24px', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '16px' }}>
          <link href={font.googleFontUrl} rel="stylesheet" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Token info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <code style={{ fontSize: '13px', fontWeight: '600' }}>{font.name}</code>
              <code style={{ fontSize: '12px', color: '#666' }}>{font.value}</code>
              <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                {font.description}
              </span>
            </div>

            {/* Font samples at different sizes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: '600', fontFamily: font.value }}>
                The quick brown fox jumps over the lazy dog
              </div>
              <div style={{ fontSize: '18px', fontWeight: '400', fontFamily: font.value }}>
                The quick brown fox jumps over the lazy dog
              </div>
              <div style={{ fontSize: '14px', fontFamily: font.value }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz
              </div>
              <div style={{ fontSize: '14px', fontFamily: font.value }}>
                0123456789 !@#$%^&*()_+-=[]{{}}|;':",./&lt;&gt;?
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

**Typography Size Comparison Pattern**:
```typescript
const TypographyComparison = () => {
  const sizes = Object.entries(semanticTypography);

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
        Size Comparison
      </h2>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '16px',
        padding: '32px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        flexWrap: 'wrap',
      }}>
        {sizes.map(([name, value]) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: value, fontWeight: '600' }}>Aa</div>
            <code style={{ fontSize: '11px', color: '#666' }}>
              {name.replace('type-font-size-', '')}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Real-World Examples Pattern** (Cards, Forms, Articles):
```typescript
export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '32px' }}>Real World Examples</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Card Example */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h3 style={{ fontSize: semanticTypography['type-font-size-l'], fontWeight: '600', marginBottom: '8px' }}>
            Card Title (Large)
          </h3>
          <p style={{ fontSize: semanticTypography['type-font-size-s'], color: '#666', marginBottom: '16px' }}>
            This is the card description using small text.
          </p>
          <div style={{ fontSize: semanticTypography['type-font-size-xs'], color: '#999' }}>
            Last updated: 2 hours ago
          </div>
        </div>

        {/* Form Example */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h3 style={{ fontSize: semanticTypography['type-font-size-l'], fontWeight: '600', marginBottom: '16px' }}>
            Form Example
          </h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: semanticTypography['type-font-size-s'], fontWeight: '600', marginBottom: '4px' }}>
              Email Address
            </label>
            <div style={{ fontSize: semanticTypography['type-font-size-m'], padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}>
              user@example.com
            </div>
            <div style={{ fontSize: semanticTypography['type-font-size-xs'], color: '#666', marginTop: '4px' }}>
              We'll never share your email with anyone else.
            </div>
          </div>
        </div>

        {/* Article Example */}
        <div style={{ padding: '32px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h1 style={{ fontSize: semanticTypography['type-font-size-xl'], fontWeight: '700', marginBottom: '8px' }}>
            Article Heading (Extra Large)
          </h1>
          <div style={{ fontSize: semanticTypography['type-font-size-xs'], color: '#999', marginBottom: '16px' }}>
            Published on October 23, 2025
          </div>
          <p style={{ fontSize: semanticTypography['type-font-size-m'], color: '#2d2d2d', lineHeight: '1.6', marginBottom: '16px' }}>
            This is the article body text using medium size for comfortable reading.
          </p>
        </div>

      </div>
    </div>
  ),
};
```

---

### 6. Radius Story

**File**: `src/stories/tokens/Radius.stories.tsx`

**Key Features**:
- Visual boxes showing actual border radius
- Component examples (buttons, cards, inputs)

**Radius Visualization Pattern**:
```typescript
const RadiusBox = ({ name, value }: { name: string; value: string }) => (
  <div style={{ marginBottom: '16px' }}>
    <div
      style={{
        width: '120px',
        height: '80px',
        backgroundColor: '#e0e0e0',
        borderRadius: value,
        marginBottom: '8px',
        border: '2px solid #0069ff',
      }}
    />
    <code style={{ fontSize: '12px', display: 'block', fontWeight: '600' }}>{name}</code>
    <code style={{ fontSize: '11px', color: '#666', display: 'block' }}>{value}</code>
  </div>
);
```

---

### 7. Shadows Story

**File**: `src/stories/tokens/Shadows.stories.tsx`

**Key Features**:
- Shadow previews with elevation comparison
- Component examples with different shadow levels

**Shadow Preview Pattern**:
```typescript
const ShadowBox = ({ name, value }: { name: string; value: string }) => (
  <div style={{ marginBottom: '24px' }}>
    <div
      style={{
        width: '200px',
        height: '120px',
        backgroundColor: '#ffffff',
        boxShadow: value,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
      }}
    >
      <span style={{ color: '#666', fontSize: '14px' }}>Hover card</span>
    </div>
    <code style={{ fontSize: '12px', display: 'block', fontWeight: '600' }}>{name}</code>
    <code style={{ fontSize: '11px', color: '#666', display: 'block', wordBreak: 'break-all' }}>{value}</code>
  </div>
);
```

---

## 🎨 Standard Styling System

### Color Palette

Use these consistent colors across all stories:

```typescript
const STORY_COLORS = {
  // Backgrounds
  pageBackground: '#ffffff',
  cardBackground: '#ffffff',
  codeBackground: '#f9f9f9',
  highlightBackground: '#e7f3ff',

  // Borders
  subtleBorder: '#e0e0e0',
  mediumBorder: '#cccccd',

  // Text
  primaryText: '#1a1a1a',
  secondaryText: '#666',
  tertiaryText: '#999',

  // Accent
  accent: '#0069ff',
  accentHover: '#0052cc',

  // Status
  warning: '#ffc107',
  warningBg: '#fff3cd',
  warningText: '#856404',
  success: '#28a745',
  successBg: '#d4edda',
};
```

### Typography Scale

```typescript
const STORY_TYPOGRAPHY = {
  h1: { fontSize: '32px', fontWeight: '700', lineHeight: '1.2' },
  h2: { fontSize: '24px', fontWeight: '600', lineHeight: '1.3' },
  h3: { fontSize: '20px', fontWeight: '600', lineHeight: '1.4' },
  h4: { fontSize: '18px', fontWeight: '600', lineHeight: '1.4' },
  body: { fontSize: '16px', fontWeight: '400', lineHeight: '1.5' },
  bodySmall: { fontSize: '14px', fontWeight: '400', lineHeight: '1.5' },
  caption: { fontSize: '12px', fontWeight: '400', lineHeight: '1.4' },
  code: { fontSize: '13px', fontFamily: 'monospace' },
  codeSmall: { fontSize: '11px', fontFamily: 'monospace' },
};
```

### Spacing Scale

```typescript
const STORY_SPACING = {
  xs: '4px',
  s: '8px',
  m: '16px',
  l: '24px',
  xl: '32px',
  xxl: '40px',
};
```

---

## 📋 Story Generation Checklist

When generating token stories, ensure:

- [ ] Import tokens from correct paths (`../../primitive-tokens/...` or `../../semantic-tokens/...`)
- [ ] Import `primitiveOther` for font family tokens
- [ ] Include Google Fonts links for typography stories
- [ ] Use consistent card styling (padding: 12px/24px, borderRadius: 8px, border: 1px solid #e0e0e0)
- [ ] Show token name, value, and CSS variable reference
- [ ] Group related tokens logically
- [ ] Add descriptive section headers
- [ ] Include usage guide at the top
- [ ] Show visual representation (swatches, bars, boxes, etc.)
- [ ] Add real-world component examples where applicable
- [ ] Handle alpha colors with checkerboard pattern
- [ ] Include multiple stories per file (AllColors, Blues, Greens, etc.)
- [ ] Use semantic HTML with proper heading hierarchy
- [ ] Add spacing between sections (marginBottom: 40px)
- [ ] Make responsive with flexWrap or grid

---

## 🔧 Import Path Reference

**Always use these exact import patterns**:

```typescript
// Primitive tokens
import { primitiveColors } from '../../primitive-tokens/colors/colors';
import { primitiveSpacing } from '../../primitive-tokens/spacing/spacing';
import { primitiveRadius } from '../../primitive-tokens/radius/radius';
import { primitiveOther } from '../../primitive-tokens/other/other'; // For font families!

// Semantic tokens
import { semanticColors } from '../../semantic-tokens/colors/colors';
import { semanticSpacing } from '../../semantic-tokens/spacing/spacing';
import { semanticTypography } from '../../semantic-tokens/typography/typography';

// Legacy tokens
import { semanticColorsLegacy } from '../../semantic-tokens/colors/colors.legacy';
```

---

## 🚀 Font Family Best Practices

### Always Check for Font Family Tokens

When generating typography stories:

1. **Check if font family tokens exist** in `primitiveOther`:
```typescript
const hasFontFamilies =
  primitiveOther['type-font-family-default'] ||
  primitiveOther['type-font-family-mono'];
```

2. **Load Google Fonts inline** using `<link>` tag in component
3. **Show multiple samples**: large heading, regular text, character sets, numbers/symbols
4. **Include font metadata**: token name, font name, description

### Google Fonts URLs

Common patterns:
```typescript
// Inter (default UI font)
'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'

// Fira Code (monospace)
'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap'

// Roboto
'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
```

---

## 🔄 Version History

- **v2.0** (2025-10-23): Major enhancement release
  - ✅ Added comprehensive token visualization patterns
  - ✅ Font family integration with Google Fonts
  - ✅ Real-world component examples (cards, forms, articles)
  - ✅ Alpha color checkerboard pattern
  - ✅ Legacy token warning banners
  - ✅ Spacing visual bars
  - ✅ Radius and shadow visualizations
  - ✅ Standard styling system
  - ✅ Import path reference guide
  - ✅ Story generation checklist

- **v1.0** (2025-10-23): Initial release
  - Content detection strategy
  - Graceful degradation for missing content
  - Onboarding stories
  - Template system for story generation
  - Auto-activation after token generation
