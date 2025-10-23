import type { Meta, StoryObj } from '@storybook/react';
import { primitiveSpacing } from '../../primitive-tokens/spacing/spacing';
import { semanticSpacing } from '../../semantic-tokens/spacing/spacing';

const meta = {
  title: 'Design Tokens/Spacing',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface SpacingItemProps {
  name: string;
  value: string;
  isPrimitive?: boolean;
}

const SpacingItem = ({ name, value, isPrimitive }: SpacingItemProps) => {
  const numericValue = parseInt(value);
  const isLarge = numericValue > 80;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
      }}
    >
      <div style={{ flex: '0 0 200px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {isPrimitive && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: '600',
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Primitive
            </span>
          )}
          <code
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#2d2d2d',
              fontFamily: 'monospace',
            }}
          >
            {name}
          </code>
          <code
            style={{
              fontSize: '12px',
              color: '#666',
              fontFamily: 'monospace',
            }}
          >
            {value}
          </code>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          minHeight: '40px',
        }}
      >
        <div
          style={{
            width: isLarge ? '100%' : value,
            height: '32px',
            backgroundColor: '#0069ff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '600',
            minWidth: numericValue < 10 ? '40px' : undefined,
          }}
        >
          {numericValue < 10 ? value : ''}
        </div>
      </div>
    </div>
  );
};

interface SpacingGroupProps {
  title: string;
  description?: string;
  spacing: Record<string, string>;
  filter?: (name: string) => boolean;
  isPrimitive?: boolean;
}

const SpacingGroup = ({ title, description, spacing, filter, isPrimitive }: SpacingGroupProps) => {
  const filteredSpacing = Object.entries(spacing).filter(([name]) =>
    filter ? filter(name) : true
  );

  if (filteredSpacing.length === 0) return null;

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#1a1a1a',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: '1.5' }}>
          {description}
        </p>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {filteredSpacing.map(([name, value]) => (
          <SpacingItem key={name} name={name} value={value} isPrimitive={isPrimitive} />
        ))}
      </div>
    </div>
  );
};

export const AllSpacing: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
            Spacing Tokens
          </h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0, lineHeight: '1.5' }}>
            Consistent spacing values for margins, padding, and gaps throughout the design system.
          </p>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#e7f3ff',
            border: '1px solid #4c96ff',
            borderRadius: '8px',
            marginBottom: '32px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#004bb7' }}>
            Usage Guide
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#004bb7', lineHeight: '1.6' }}>
            <strong>Semantic tokens</strong> (gap-*, stroke-*) are named by purpose and should be
            used in components. <strong>Primitive tokens</strong> (scale-*, maxwidth-*) provide the
            raw values and are primarily used in semantic token definitions.
          </p>
        </div>

        <SpacingGroup
          title="Gap Tokens"
          description="Spacing between elements (margins, padding, gaps)"
          spacing={semanticSpacing}
          filter={(name) => name.startsWith('gap-')}
        />

        <SpacingGroup
          title="Stroke Tokens"
          description="Border and line widths"
          spacing={semanticSpacing}
          filter={(name) => name.startsWith('stroke-')}
        />

        <SpacingGroup
          title="Primitive Scale"
          description="Base spacing scale from 0px to 200px"
          spacing={primitiveSpacing}
          filter={(name) => name.startsWith('scale-')}
          isPrimitive
        />

        <SpacingGroup
          title="Max Width Containers"
          description="Container widths for responsive layouts"
          spacing={primitiveSpacing}
          filter={(name) => name.startsWith('maxwidth-')}
          isPrimitive
        />
      </div>
    );
  },
};

export const SemanticSpacing: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Semantic Spacing</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Use these spacing tokens in your components for consistent layout
      </p>
      <SpacingGroup
        title="Gaps"
        description="Use for margins, padding, and flex/grid gaps"
        spacing={semanticSpacing}
        filter={(name) => name.startsWith('gap-')}
      />
      <SpacingGroup
        title="Strokes"
        description="Use for border widths"
        spacing={semanticSpacing}
        filter={(name) => name.startsWith('stroke-')}
      />
    </div>
  ),
};

export const PrimitiveSpacing: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Primitive Spacing</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Foundation spacing values used to build semantic tokens
      </p>
      <SpacingGroup
        title="Scale"
        spacing={primitiveSpacing}
        filter={(name) => name.startsWith('scale-')}
        isPrimitive
      />
      <SpacingGroup
        title="Container Widths"
        spacing={primitiveSpacing}
        filter={(name) => name.startsWith('maxwidth-')}
        isPrimitive
      />
    </div>
  ),
};

export const SpacingScale: Story = {
  render: () => {
    const scaleTokens = Object.entries(primitiveSpacing).filter(([name]) =>
      name.startsWith('scale-')
    );

    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Spacing Scale Visualization</h1>
        <p style={{ marginBottom: '32px', color: '#666' }}>
          Visual representation of the spacing scale progression
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '24px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
          }}
        >
          {scaleTokens.map(([name, value]) => {
            const numericValue = parseInt(value);
            return (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <code
                  style={{
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    minWidth: '120px',
                    color: '#666',
                  }}
                >
                  {name}
                </code>
                <code
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    minWidth: '50px',
                    color: '#999',
                  }}
                >
                  {value}
                </code>
                <div
                  style={{
                    height: '24px',
                    width: numericValue > 160 ? '100%' : value,
                    backgroundColor: '#0069ff',
                    borderRadius: '2px',
                    minWidth: numericValue === 0 ? '2px' : undefined,
                    border: numericValue === 0 ? '1px solid #0069ff' : undefined,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
