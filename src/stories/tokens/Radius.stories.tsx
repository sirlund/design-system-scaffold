import type { Meta, StoryObj } from '@storybook/react';
import { primitiveRadius } from '../../primitive-tokens/radius/radius';
import { semanticRadius } from '../../semantic-tokens/radius/radius';

const meta = {
  title: 'Design Tokens/Radius',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface RadiusItemProps {
  name: string;
  value: string;
  isPrimitive?: boolean;
}

const RadiusItem = ({ name, value, isPrimitive }: RadiusItemProps) => {
  const isRounded = value === '9999px';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
      }}
    >
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
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Small box */}
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#0069ff',
            borderRadius: value,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '600',
          }}
        >
          80×80
        </div>
        {/* Medium box */}
        <div
          style={{
            width: '120px',
            height: '80px',
            backgroundColor: '#4c96ff',
            borderRadius: value,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '600',
          }}
        >
          120×80
        </div>
        {/* Large box */}
        {!isRounded && (
          <div
            style={{
              width: '200px',
              height: '80px',
              backgroundColor: '#b4d3ff',
              borderRadius: value,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#004bb7',
              fontSize: '11px',
              fontWeight: '600',
            }}
          >
            200×80
          </div>
        )}
        {/* Pill shape for rounded */}
        {isRounded && (
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: '#b4d3ff',
              borderRadius: value,
              color: '#004bb7',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            Pill Shape
          </div>
        )}
      </div>
    </div>
  );
};

interface RadiusGroupProps {
  title: string;
  description?: string;
  radius: Record<string, string>;
  filter?: (name: string) => boolean;
  isPrimitive?: boolean;
}

const RadiusGroup = ({ title, description, radius, filter, isPrimitive }: RadiusGroupProps) => {
  const filteredRadius = Object.entries(radius).filter(([name]) =>
    filter ? filter(name) : true
  );

  if (filteredRadius.length === 0) return null;

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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredRadius.map(([name, value]) => (
          <RadiusItem key={name} name={name} value={value} isPrimitive={isPrimitive} />
        ))}
      </div>
    </div>
  );
};

export const AllRadius: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
            Radius Tokens
          </h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0, lineHeight: '1.5' }}>
            Border radius tokens for consistent rounded corners throughout the design system.
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
            <strong>Semantic tokens</strong> (radius-xs through radius-xl) are named by size and
            should be used in components. <strong>Primitive tokens</strong> (radius-none,
            radius-rounded) provide special values for no rounding and fully rounded (pill) shapes.
          </p>
        </div>

        <RadiusGroup
          title="Semantic Radius"
          description="Use these radius tokens in components for consistent rounded corners"
          radius={semanticRadius}
        />

        <RadiusGroup
          title="Primitive Radius"
          description="Special radius values for edge cases"
          radius={primitiveRadius}
          isPrimitive
        />
      </div>
    );
  },
};

export const SemanticRadius: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Semantic Radius Tokens</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Use these radius tokens for consistent rounded corners in your components
      </p>
      <RadiusGroup
        title="Radius Scale"
        description="From extra small (4px) to extra large (16px)"
        radius={semanticRadius}
      />
    </div>
  ),
};

export const PrimitiveRadius: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Primitive Radius Tokens</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Special radius values for specific use cases
      </p>
      <RadiusGroup
        title="Special Values"
        description="None (sharp corners) and rounded (pill shape)"
        radius={primitiveRadius}
        isPrimitive
      />
    </div>
  ),
};

export const RadiusExamples: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '32px' }}>Radius in Components</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Button Examples */}
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1a1a1a' }}>Buttons</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0069ff',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: semanticRadius['radius-s'],
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Small Radius (6px)
              </button>
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0069ff',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: semanticRadius['radius-m'],
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Medium Radius (8px)
              </button>
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0069ff',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: primitiveRadius['radius-rounded'],
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Pill Button (9999px)
              </button>
            </div>
          </div>

          {/* Card Examples */}
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1a1a1a' }}>Cards</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: semanticRadius['radius-m'],
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Card with radius-m</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  This card uses the medium radius token (8px)
                </p>
              </div>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: semanticRadius['radius-l'],
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Card with radius-l</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  This card uses the large radius token (12px)
                </p>
              </div>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: semanticRadius['radius-xl'],
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Card with radius-xl</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  This card uses the extra large radius token (16px)
                </p>
              </div>
            </div>
          </div>

          {/* Input Examples */}
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1a1a1a' }}>Inputs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    marginBottom: '4px',
                    fontWeight: '600',
                  }}
                >
                  Extra Small Radius (4px)
                </label>
                <div
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ccc',
                    borderRadius: semanticRadius['radius-xs'],
                    fontSize: '14px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  Input field
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    marginBottom: '4px',
                    fontWeight: '600',
                  }}
                >
                  Small Radius (6px)
                </label>
                <div
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ccc',
                    borderRadius: semanticRadius['radius-s'],
                    fontSize: '14px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  Input field
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    marginBottom: '4px',
                    fontWeight: '600',
                  }}
                >
                  Medium Radius (8px)
                </label>
                <div
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ccc',
                    borderRadius: semanticRadius['radius-m'],
                    fontSize: '14px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  Input field
                </div>
              </div>
            </div>
          </div>

          {/* Badge/Tag Examples */}
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1a1a1a' }}>Badges & Tags</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#e8f3ff',
                  color: '#004bb7',
                  borderRadius: semanticRadius['radius-xs'],
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                XS Radius
              </span>
              <span
                style={{
                  padding: '4px 12px',
                  backgroundColor: '#dff7ed',
                  color: '#14583d',
                  borderRadius: semanticRadius['radius-s'],
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                S Radius
              </span>
              <span
                style={{
                  padding: '6px 16px',
                  backgroundColor: '#fff3cd',
                  color: '#816500',
                  borderRadius: primitiveRadius['radius-rounded'],
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Pill Badge
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
