# Storybook Configuration Guide

This document explains how to configure automated Storybook story generation using the `storybook-config.json` file.

## Table of Contents

- [Overview](#overview)
- [Configuration File](#configuration-file)
- [Configuration Sections](#configuration-sections)
- [Customization Examples](#customization-examples)
- [Using with Agents](#using-with-agents)
- [Advanced Usage](#advanced-usage)

---

## Overview

The Storybook configuration system allows you to:

- **Define default layouts** for token and component stories
- **Customize visual representations** of design tokens
- **Configure onboarding messages** for empty states
- **Set up automatic story generation** rules
- **Customize styling and theming**
- **Enable/disable features** as needed

The configuration is stored in `.storybook/storybook-config.json` and is used by the Storybook Documentation Agent to generate stories automatically.

---

## Configuration File

Location: `.storybook/storybook-config.json`

The configuration file is validated against a JSON schema (`.storybook/storybook-config.schema.json`) which provides:
- Type checking
- Autocomplete in supported editors (VS Code, WebStorm, etc.)
- Validation to prevent invalid configurations

---

## Configuration Sections

### 1. Meta

Project metadata and information:

```json
{
  "meta": {
    "projectName": "Design System Scaffold",
    "description": "A modern design system built with React, TypeScript, and Storybook",
    "author": "Your Team",
    "documentation": "https://your-docs-url.com"
  }
}
```

### 2. Layout

Configure the Storybook layout and navigation:

#### Introduction Page

```json
{
  "layout": {
    "introduction": {
      "enabled": true,
      "title": "Welcome to Your Design System",
      "subtitle": "Build consistent, accessible experiences",
      "sections": [
        {
          "type": "hero",
          "title": "🚀 Getting Started",
          "content": "Your design system scaffold is ready!"
        },
        {
          "type": "quick-start",
          "title": "Quick Start Guide",
          "steps": [...]
        }
      ]
    }
  }
}
```

**Section Types:**
- `hero` - Large hero section with title and content
- `quick-start` - Numbered steps with commands
- `links` - Collection of useful links
- `info` - Information box
- `custom` - Custom HTML/Markdown content

#### Navigation Structure

```json
{
  "layout": {
    "navigation": {
      "structure": "hierarchical",
      "groups": [
        {
          "id": "design-tokens",
          "title": "Design Tokens",
          "icon": "🎨",
          "order": 2,
          "collapsed": false
        }
      ]
    }
  }
}
```

**Navigation Structures:**
- `hierarchical` - Nested groups (default)
- `flat` - Single level
- `custom` - Custom structure

### 3. Stories

Configure story generation for design tokens and components:

#### Design Tokens

```json
{
  "stories": {
    "designTokens": {
      "enabled": true,
      "autoGenerate": true,
      "categories": [
        {
          "id": "primitive-colors",
          "title": "Colors",
          "subtitle": "Base color palette",
          "path": "Design Tokens/Primitive/Colors",
          "source": "src/primitive-tokens/colors",
          "visualizationType": "color-swatch-grid",
          "groupBy": "color-family",
          "sortOrder": ["red", "orange", "yellow", "green", "blue"],
          "options": {
            "showHex": true,
            "showCssVar": true,
            "cardStyle": "elevated"
          }
        }
      ]
    }
  }
}
```

**Visualization Types:**
- `color-swatch-grid` - Grid of color swatches
- `color-swatch-categorized` - Categorized color groups
- `dimension-showcase` - Visual dimension representations
- `radius-demo` - Border radius demonstrations
- `typography-scale` - Font size scale with samples
- `custom` - Custom visualization

**Grouping Options:**
- `color-family` - Group by color family (red, blue, etc.)
- `semantic-category` - Group by semantic purpose (primary, accent, etc.)
- `dimension-type` - Group by dimension type (scale, gap, radius, etc.)

#### Components

```json
{
  "stories": {
    "components": {
      "enabled": true,
      "autoGenerate": true,
      "path": "Components",
      "source": "src/components",
      "options": {
        "showProps": true,
        "showVariants": true,
        "showStates": true,
        "showAccessibility": true,
        "showCode": true,
        "layout": "centered"
      },
      "storyTemplates": [
        {
          "name": "Default",
          "description": "Basic component with default props"
        },
        {
          "name": "AllVariants",
          "description": "Showcase all variant combinations",
          "layout": "padded"
        }
      ]
    }
  }
}
```

#### Onboarding

```json
{
  "stories": {
    "onboarding": {
      "enabled": true,
      "showWhenEmpty": true,
      "title": "Get Started",
      "messages": {
        "noTokens": {
          "title": "No Design Tokens Yet",
          "description": "Extract design tokens from your Figma file to get started.",
          "command": "/tokens-from-figma https://figma.com/file/YOUR_FILE_ID",
          "icon": "🎨"
        }
      }
    }
  }
}
```

### 4. Visualization

Configure visual representations:

```json
{
  "visualization": {
    "colorSwatchGrid": {
      "cardStyle": "elevated",
      "showLabels": true,
      "showValues": true,
      "showCssVars": true,
      "hoverEffects": true,
      "columns": {
        "mobile": 2,
        "tablet": 3,
        "desktop": 4
      }
    },
    "dimensionShowcase": {
      "visualRepresentations": {
        "scale": {
          "type": "horizontal-bar",
          "color": "#4F46E5"
        },
        "radius": {
          "type": "rounded-square",
          "color": "#10B981",
          "size": "80px"
        }
      }
    }
  }
}
```

### 5. Styling

Customize colors, typography, and spacing:

```json
{
  "styling": {
    "theme": {
      "primary": "#4F46E5",
      "secondary": "#10B981",
      "background": "#FFFFFF",
      "text": "#121213"
    },
    "typography": {
      "fontFamily": "'Inter', sans-serif",
      "monospaceFontFamily": "'Fira Code', monospace"
    },
    "spacing": {
      "cardPadding": "16px",
      "sectionSpacing": "40px",
      "gridGap": "20px"
    }
  }
}
```

### 6. Behavior

Configure agent behavior:

```json
{
  "behavior": {
    "autoRegenerate": true,
    "watchPaths": [
      "src/primitive-tokens/**/*",
      "src/semantic-tokens/**/*",
      "src/components/**/*"
    ],
    "detectContent": true,
    "showPlaceholders": true,
    "gracefulDegradation": true
  }
}
```

**Options:**
- `autoRegenerate` - Automatically regenerate stories when content changes
- `watchPaths` - File patterns to watch for changes
- `detectContent` - Automatically detect available content
- `showPlaceholders` - Show helpful placeholders when content is missing
- `gracefulDegradation` - Gracefully handle missing dependencies

---

## Customization Examples

### Example 1: Disable Onboarding Messages

```json
{
  "stories": {
    "onboarding": {
      "enabled": false,
      "showWhenEmpty": false
    }
  }
}
```

### Example 2: Customize Color Card Style

```json
{
  "stories": {
    "designTokens": {
      "categories": [
        {
          "id": "primitive-colors",
          "options": {
            "cardStyle": "minimal",
            "showHex": true,
            "showRgb": true,
            "showCssVar": false
          }
        }
      ]
    }
  }
}
```

### Example 3: Add Custom Token Category

```json
{
  "stories": {
    "designTokens": {
      "categories": [
        {
          "id": "shadows",
          "title": "Shadows",
          "subtitle": "Elevation and depth",
          "path": "Design Tokens/Shadows",
          "source": "src/primitive-tokens/shadows",
          "visualizationType": "custom",
          "options": {
            "customComponent": "ShadowVisualization"
          }
        }
      ]
    }
  }
}
```

### Example 4: Custom Navigation Groups

```json
{
  "layout": {
    "navigation": {
      "structure": "hierarchical",
      "groups": [
        {
          "id": "foundations",
          "title": "Foundations",
          "icon": "🏗️",
          "order": 1,
          "collapsed": false
        },
        {
          "id": "patterns",
          "title": "Patterns",
          "icon": "📐",
          "order": 2,
          "collapsed": true
        }
      ]
    }
  }
}
```

### Example 5: Disable Auto-Generation

```json
{
  "stories": {
    "designTokens": {
      "enabled": true,
      "autoGenerate": false
    },
    "components": {
      "enabled": true,
      "autoGenerate": false
    }
  },
  "behavior": {
    "autoRegenerate": false,
    "detectContent": false
  }
}
```

---

## Using with Agents

### Storybook Documentation Agent

The agent reads this configuration file to determine what stories to generate:

```bash
# Generate stories using the config
"generate storybook stories"

# Regenerate all stories
"regenerate storybook documentation"

# Generate specific category
"generate color token stories"
```

### Customizing via LLM

You can ask any LLM agent to modify the configuration:

```bash
# Example prompts:
"Update the storybook config to use a darker color scheme"
"Add a new token category for animations"
"Disable onboarding messages"
"Change the color card style to minimal"
"Add a custom navigation group for utilities"
```

The agent will:
1. Read the current configuration
2. Understand your requirements
3. Update the configuration file
4. Validate against the schema
5. Regenerate affected stories

---

## Advanced Usage

### Custom Templates

Enable custom templates for advanced use cases:

```json
{
  "advanced": {
    "customTemplates": {
      "enabled": true,
      "path": ".storybook/templates"
    }
  }
}
```

Create templates in `.storybook/templates/`:
- `color-swatch.tsx` - Custom color swatch component
- `dimension-card.tsx` - Custom dimension card
- `story-wrapper.tsx` - Custom story wrapper

### Hooks

Add hooks for custom behavior:

```json
{
  "advanced": {
    "hooks": {
      "beforeGenerate": "scripts/before-generate.js",
      "afterGenerate": "scripts/after-generate.js",
      "onContentDetected": "scripts/on-content-detected.js"
    }
  }
}
```

### Plugins

Enable plugins for extended functionality:

```json
{
  "advanced": {
    "plugins": {
      "enabled": true,
      "path": ".storybook/plugins"
    }
  }
}
```

---

## Configuration Validation

The configuration is validated automatically when loaded. Common errors:

### Invalid Version Format

```json
// ❌ Wrong
"version": "1.0"

// ✅ Correct
"version": "1.0.0"
```

### Invalid Visualization Type

```json
// ❌ Wrong
"visualizationType": "color-grid"

// ✅ Correct
"visualizationType": "color-swatch-grid"
```

### Missing Required Fields

```json
// ❌ Wrong (missing 'source')
{
  "id": "colors",
  "title": "Colors",
  "path": "Design Tokens/Colors"
}

// ✅ Correct
{
  "id": "colors",
  "title": "Colors",
  "path": "Design Tokens/Colors",
  "source": "src/primitive-tokens/colors"
}
```

---

## Best Practices

### 1. Keep Configuration Organized

Group related settings together and use comments:

```json
{
  "stories": {
    "designTokens": {
      "enabled": true,
      "categories": [
        // Primitive tokens
        { "id": "primitive-colors", ... },
        { "id": "spacing", ... },

        // Semantic tokens
        { "id": "semantic-colors", ... }
      ]
    }
  }
}
```

### 2. Use Semantic IDs

Choose clear, descriptive IDs:

```json
// ❌ Not ideal
"id": "colors1"

// ✅ Better
"id": "primitive-colors"

// ✅ Best
"id": "primitive-colors-base-palette"
```

### 3. Start Simple

Begin with default configuration and add complexity as needed:

```json
{
  "stories": {
    "designTokens": {
      "enabled": true,
      "autoGenerate": true
      // Add more options later as needed
    }
  }
}
```

### 4. Document Custom Settings

Add comments explaining custom configurations:

```json
{
  "visualization": {
    "colorSwatchGrid": {
      "columns": {
        // Using 3 columns on tablet for better visibility
        "tablet": 3
      }
    }
  }
}
```

### 5. Version Control

Commit the configuration file to version control:

```bash
git add .storybook/storybook-config.json
git commit -m "Update Storybook configuration"
```

---

## Troubleshooting

### Stories Not Generating

1. Check that `enabled` is `true` in the relevant section
2. Verify `source` paths are correct
3. Ensure content exists at the source paths
4. Check for validation errors

### Visual Issues

1. Verify `visualizationType` is valid
2. Check `styling` configuration
3. Review custom template paths (if using)

### Content Not Detected

1. Enable `detectContent` in `behavior`
2. Verify `watchPaths` includes relevant directories
3. Check file permissions

---

## Getting Help

For issues or questions:

1. Check the [Agent Documentation](./../.claude/agents/storybook-docs-agent.md)
2. Review the [JSON Schema](./storybook-config.schema.json)
3. Ask the Storybook Documentation Agent for help:
   ```
   "Help me configure storybook for my project"
   ```

---

## Version History

- **v1.0.0** (2025-10-23): Initial configuration system
  - Core configuration structure
  - Design token story generation
  - Component story generation
  - Onboarding messages
  - Visual customization options
