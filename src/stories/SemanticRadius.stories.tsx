import type { Meta, StoryObj } from '@storybook/react';
import { componentRadius } from '../design-tokens/semantic-radius';
import '../design-tokens/semantic-radius.css';
import '../figma-tokens/radius/radius.css';

const meta = {
  title: 'Semantic Tokens/Radius',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const RadiusItem = ({ name, value, cssVar }: { name: string; value: string; cssVar: string }) => (
  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ flex: '0 0 140px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
      {name}
    </div>
    <div
      style={{
        width: '80px',
        height: '80px',
        backgroundColor: '#2196F3',
        borderRadius: value,
      }}
    />
    <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
      <div style={{ color: '#666' }}>{value}</div>
      <div style={{ color: '#999', fontSize: '11px' }}>var({cssVar})</div>
    </div>
  </div>
);

export const AllSemanticRadius: Story = {
  render: () => (
    <div>
      <h1>Semantic Radius Tokens</h1>
      <p style={{ color: '#666', marginBottom: '32px', maxWidth: '800px' }}>
        Semantic radius tokens provide the <strong>PUBLIC API</strong> for border radius. Unlike
        primitive tokens (radius-0, radius-4, etc.), semantic tokens are named by their
        <strong> usage context and component type</strong>.
      </p>

      <div style={{ marginBottom: '32px' }}>
        <h3>Basic Radii</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          General-purpose radius values for common use cases
        </p>
        {['none', 'sm', 'md', 'lg', 'xl', 'full'].map((name) => (
          <RadiusItem
            key={name}
            name={name}
            value={componentRadius[name as keyof typeof componentRadius]}
            cssVar={`--radius-${name}`}
          />
        ))}
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3>Component-Specific Radii</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Radius values for specific component types
        </p>
        {Object.entries(componentRadius)
          .filter(([name]) => !['none', 'sm', 'md', 'lg', 'xl', 'full'].includes(name))
          .map(([name, value]) => (
            <RadiusItem
              key={name}
              name={name}
              value={value}
              cssVar={`--radius-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
            />
          ))}
      </div>
    </div>
  ),
};

export const BasicRadii: Story = {
  render: () => (
    <div>
      <h1>Basic Radii</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        General-purpose radius values for common use cases.
      </p>
      {['none', 'sm', 'md', 'lg', 'xl', 'full'].map((name) => (
        <RadiusItem
          key={name}
          name={name}
          value={componentRadius[name as keyof typeof componentRadius]}
          cssVar={`--radius-${name}`}
        />
      ))}
    </div>
  ),
};

export const ComponentRadii: Story = {
  render: () => (
    <div>
      <h1>Component-Specific Radii</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Radius values defined for specific component types. Use these to ensure consistent rounding
        across your design system.
      </p>
      {Object.entries(componentRadius)
        .filter(([name]) => !['none', 'sm', 'md', 'lg', 'xl', 'full'].includes(name))
        .map(([name, value]) => (
          <RadiusItem
            key={name}
            name={name}
            value={value}
            cssVar={`--radius-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
          />
        ))}
    </div>
  ),
};
