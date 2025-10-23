# Design System Scaffold

**Universal design system generator - from Figma to production in minutes**

Transform any Figma file into a complete, production-ready design system with AI-powered agents.

## Features

- Design Tokens (primitives + semantics)
- React Components (TypeScript + CSS Modules)
- Storybook Documentation (auto-generated)
- Type Safety (full TypeScript support)
- Config-driven (works with any Figma file)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Storybook

```bash
npm run storybook
```

Open [http://localhost:6006](http://localhost:6006) to view the documentation.

### 3. Connect to Figma

Extract design tokens from your Figma file using the AI agent:

```bash
# Using Figma MCP (recommended)
/tokens-from-figma https://figma.com/file/YOUR_FILE_ID

# Or manually: export JSON from Figma and place in imported-from-figma/
# Then run: npm run tokens:transform
```

### 4. Generate Components

Build React components from your Figma designs:

```bash
/component-from-figma button
/component-from-figma card
/component-from-figma input
```

### 5. Customize & Build

Review the generated code, customize as needed, and build:

```bash
npm run build
```

## Configuration

Edit `scaffold.config.js` to customize:

- Token classification rules
- Naming conventions
- Output structure
- Semantic token generation strategy

## AI Agents

This scaffold includes three specialized AI agents:

### Design Tokens Agent
Extracts and transforms design tokens from Figma exports.

**Commands**: `/tokens-from-figma`

**Features**:
- Heuristic token classification (primitives vs semantics)
- Smart semantic suggestions with confidence levels
- Name transformations and cleanup
- Quality audit (hardcoded values, broken references)

### Storybook Documentation Agent
Generates beautiful documentation for your tokens and components.

**Auto-activated** after token generation.

**Features**:
- Interactive token galleries
- Component usage examples
- Live code previews
- Accessibility documentation

### Component Builder Agent
Builds React components from Figma designs using your tokens.

**Commands**: `/component-from-figma [name]`

**Features**:
- TypeScript components with full type safety
- CSS Modules with design token references
- Storybook stories with all variants
- Accessibility features (ARIA, keyboard navigation)

## Project Structure

```
design-system-scaffold/
├── .storybook/              # Storybook configuration
├── src/
│   ├── .claude/             # AI agent instructions
│   │   ├── agents/          # Agent behavior definitions
│   │   ├── commands/        # Slash commands
│   │   └── templates/       # Code generation templates
│   ├── components/          # React components (generated)
│   ├── figma-tokens/        # Design tokens (generated)
│   └── Introduction.mdx     # Storybook welcome page
├── imported-from-figma/     # Figma JSON exports (place here)
├── scaffold.config.js       # Configuration (edit this!)
└── package.json
```

## Token Architecture

This scaffold uses a 3-layer token architecture:

### 1. Primitives (Auto-generated from Figma)
- Source: Figma Variables/Styles
- Naming: Scale-based, verbose, namespaced
- Examples: `green-100`, `spacing-16`, `font-size-14`
- **Never edit manually** - regenerate from Figma

### 2. Semantics (Manually curated or AI-suggested)
- Source: Your design system
- Naming: Intent-based, concise, component-scoped
- Examples: `color-primary`, `button-padding`, `text-heading`
- **Edit freely** - this is your public API

### 3. Components (Use semantics only)
- Source: Your code
- References: Only semantic tokens
- Never reference primitives directly in components

## Workflows

### Updating Tokens

When you update your Figma file:

1. Export new JSON or run `/tokens-from-figma`
2. Review primitive token changes
3. Update semantic token references if needed
4. Run quality audit
5. Test components with new tokens

### Creating Components

When building a new component:

1. Run `/component-from-figma [name]`
2. Review generated code
3. Customize behavior and variants
4. Add tests and accessibility features
5. Document usage in Storybook

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run storybook` - Start Storybook dev server
- `npm run build-storybook` - Build static Storybook

## License

MIT
