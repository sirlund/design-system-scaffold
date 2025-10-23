import type { Meta, StoryObj } from '@storybook/react';
import { semanticColorsLegacy } from '../../semantic-tokens/colors/colors.legacy';

const meta = {
  title: 'Design Tokens/Semantic/Legacy Colors',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface ColorSwatchProps {
  name: string;
  value: string;
}

const ColorSwatch = ({ name, value }: ColorSwatchProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '80px',
          borderRadius: '6px',
          backgroundColor: value,
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <code
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#2d2d2d',
            fontFamily: 'monospace',
          }}
        >
          {name}
        </code>
        <code
          style={{
            fontSize: '11px',
            color: '#666',
            fontFamily: 'monospace',
          }}
        >
          {value}
        </code>
      </div>
    </div>
  );
};

export const LegacyColors: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
            Legacy Color Tokens
          </h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '12px', lineHeight: '1.5' }}>
            Deprecated stroke tokens maintained for backward compatibility.
          </p>
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <strong style={{ color: '#856404', display: 'block', marginBottom: '4px' }}>
                  Deprecated
                </strong>
                <p style={{ margin: 0, fontSize: '14px', color: '#856404', lineHeight: '1.5' }}>
                  These tokens are legacy and should not be used in new code. Use the alpha-based
                  stroke tokens from the semantic colors instead (e.g., system-stroke-default-alpha-subtle).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#1a1a1a',
            }}
          >
            Default Strokes (Legacy)
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: '1.5' }}>
            Use system-stroke-default-alpha-* tokens instead
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            {Object.entries(semanticColorsLegacy)
              .filter(([name]) => name.includes('stroke-default'))
              .map(([name, value]) => (
                <ColorSwatch key={name} name={name} value={value} />
              ))}
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#1a1a1a',
            }}
          >
            On Dark Strokes (Legacy)
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: '1.5' }}>
            Use system-stroke-ondark-alpha-* tokens instead
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            {Object.entries(semanticColorsLegacy)
              .filter(([name]) => name.includes('stroke-ondark'))
              .map(([name, value]) => (
                <ColorSwatch key={name} name={name} value={value} />
              ))}
          </div>
        </div>

        <div
          style={{
            marginTop: '48px',
            padding: '20px',
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
            border: '1px solid #4c96ff',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#004bb7' }}>
            Migration Guide
          </h3>
          <div style={{ fontSize: '14px', color: '#004bb7', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '12px' }}>Replace legacy tokens with alpha-based alternatives:</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><code>system-stroke-default-subtle</code> → <code>system-stroke-default-alpha-subtle</code></li>
              <li><code>system-stroke-default-medium</code> → <code>system-stroke-default-alpha-medium</code></li>
              <li><code>system-stroke-default-strong</code> → <code>system-stroke-default-alpha-strong</code></li>
              <li><code>system-stroke-ondark-subtle</code> → <code>system-stroke-ondark-alpha-subtle</code></li>
              <li><code>system-stroke-ondark-medium</code> → <code>system-stroke-ondark-alpha-medium</code></li>
              <li><code>system-stroke-ondark-strong</code> → <code>system-stroke-ondark-alpha-strong</code></li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};
