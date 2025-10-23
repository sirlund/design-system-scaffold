import type { Meta, StoryObj } from '@storybook/react';
import {
  layoutSpacing,
  componentSpacing,
  elementSpacing,
  componentSizes,
} from '../design-tokens/semantic-spacing';
import '../design-tokens/semantic-spacing.css';
import '../figma-tokens/spacing/spacing.css';

const meta = {
  title: 'Semantic Tokens/Spacing',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SpacingItem = ({ name, value, cssVar }: { name: string; value: string; cssVar: string }) => (
  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ flex: '0 0 160px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
      {name}
    </div>
    <div
      style={{
        height: '40px',
        width: value,
        backgroundColor: '#4CAF50',
        borderRadius: '2px',
      }}
    />
    <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
      <div style={{ color: '#666' }}>{value}</div>
      <div style={{ color: '#999', fontSize: '11px' }}>var({cssVar})</div>
    </div>
  </div>
);

const SizeItem = ({ name, value, cssVar }: { name: string; value: string; cssVar: string }) => (
  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ flex: '0 0 160px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
      {name}
    </div>
    <div
      style={{
        width: value,
        height: value,
        backgroundColor: '#2196F3',
        borderRadius: '2px',
      }}
    />
    <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
      <div style={{ color: '#666' }}>{value}</div>
      <div style={{ color: '#999', fontSize: '11px' }}>var({cssVar})</div>
    </div>
  </div>
);

const SpacingGroup = ({
  title,
  description,
  spacing,
  cssPrefix,
}: {
  title: string;
  description: string;
  spacing: Record<string, string>;
  cssPrefix: string;
}) => (
  <div style={{ marginBottom: '32px' }}>
    <h3>{title}</h3>
    <p style={{ color: '#666', marginBottom: '16px' }}>{description}</p>
    {Object.entries(spacing).map(([name, value]) => (
      <SpacingItem
        key={name}
        name={name}
        value={value}
        cssVar={`--${cssPrefix}-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
      />
    ))}
  </div>
);

export const LayoutSpacing: Story = {
  render: () => (
    <div>
      <h1>Layout Spacing</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Spacing for layout-level composition. Use these for page gutters, section gaps, and grid
        layouts.
      </p>
      <SpacingGroup
        title="Layout Tokens"
        description="Spacing values for page-level layout"
        spacing={layoutSpacing}
        cssPrefix="layout"
      />
    </div>
  ),
};

export const ComponentSpacing: Story = {
  render: () => (
    <div>
      <h1>Component Spacing</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Spacing within and between components. Use these for padding, gaps, and margins.
      </p>
      {Object.entries(componentSpacing).map(([name, value]) => (
        <SpacingItem
          key={name}
          name={name}
          value={value}
          cssVar={`--spacing-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
        />
      ))}
    </div>
  ),
};

export const ElementSpacing: Story = {
  render: () => (
    <div>
      <h1>Element Spacing</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Fine-grained spacing for elements within components. Use these for icon gaps, label gaps,
        and inline spacing.
      </p>
      <SpacingGroup
        title="Element Tokens"
        description="Spacing values for element-level composition"
        spacing={elementSpacing}
        cssPrefix="element"
      />
    </div>
  ),
};

export const ComponentSizes: Story = {
  render: () => (
    <div>
      <h1>Component Sizes</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Sizes for interactive components like buttons, inputs, icons, and avatars.
      </p>
      {Object.entries(componentSizes).map(([name, value]) => (
        <SizeItem
          key={name}
          name={name}
          value={value}
          cssVar={`--size-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
        />
      ))}
    </div>
  ),
};

export const AllSemanticSpacing: Story = {
  render: () => (
    <div>
      <h1>Semantic Spacing & Size Tokens</h1>
      <p style={{ color: '#666', marginBottom: '32px', maxWidth: '800px' }}>
        Semantic spacing tokens provide the <strong>PUBLIC API</strong> for spacing and sizing.
        Unlike primitive tokens (spacing-4, size-32, etc.), semantic tokens are named by their
        <strong> purpose and usage context</strong>.
      </p>

      <SpacingGroup
        title="Layout Spacing"
        description="Spacing for page-level layout composition"
        spacing={layoutSpacing}
        cssPrefix="layout"
      />

      <div style={{ marginBottom: '32px' }}>
        <h3>Component Spacing</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Spacing within and between components (padding, gaps, margins)
        </p>
        {Object.entries(componentSpacing).map(([name, value]) => (
          <SpacingItem
            key={name}
            name={name}
            value={value}
            cssVar={`--spacing-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
          />
        ))}
      </div>

      <SpacingGroup
        title="Element Spacing"
        description="Fine-grained spacing for elements within components"
        spacing={elementSpacing}
        cssPrefix="element"
      />

      <div style={{ marginBottom: '32px' }}>
        <h3>Component Sizes</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Sizes for buttons, inputs, icons, and avatars
        </p>
        {Object.entries(componentSizes).map(([name, value]) => (
          <SizeItem
            key={name}
            name={name}
            value={value}
            cssVar={`--size-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  ),
};
