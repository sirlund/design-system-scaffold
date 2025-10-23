import type { Meta, StoryObj } from '@storybook/react';
import { primitiveShadows } from '../../primitive-tokens/shadows/shadows';

const meta = {
  title: 'Design Tokens/Shadows',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface ShadowLayer {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
  inset?: boolean;
  backgroundBlur?: boolean;
}

const convertShadowToCSS = (shadowLayers: ShadowLayer[]): string => {
  return shadowLayers
    .filter((layer) => !layer.backgroundBlur)
    .map((layer) => {
      const parts = [
        layer.inset ? 'inset' : '',
        layer.offsetX,
        layer.offsetY,
        layer.blur,
        layer.spread,
        layer.color,
      ];
      return parts.filter(Boolean).join(' ');
    })
    .join(', ');
};

interface ShadowItemProps {
  name: string;
  shadowLayers: ShadowLayer[];
}

const ShadowItem = ({ name, shadowLayers }: ShadowItemProps) => {
  const cssBoxShadow = convertShadowToCSS(shadowLayers);
  const hasBackdropBlur = shadowLayers.some((layer) => layer.backgroundBlur);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
        {hasBackdropBlur && (
          <span
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Includes backdrop-blur
          </span>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
        }}
      >
        <div
          style={{
            width: '200px',
            height: '120px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: cssBoxShadow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Shadow Preview
        </div>
      </div>
      <details style={{ fontSize: '12px', color: '#666' }}>
        <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '8px' }}>
          CSS Code
        </summary>
        <code
          style={{
            display: 'block',
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '11px',
            lineHeight: '1.5',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          box-shadow: {cssBoxShadow};
        </code>
      </details>
    </div>
  );
};

interface ShadowGroupProps {
  title: string;
  description?: string;
  shadows: Record<string, ShadowLayer[]>;
  filter?: (name: string) => boolean;
}

const ShadowGroup = ({ title, description, shadows, filter }: ShadowGroupProps) => {
  const filteredShadows = Object.entries(shadows).filter(([name]) =>
    filter ? filter(name) : true
  );

  if (filteredShadows.length === 0) return null;

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
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredShadows.map(([name, shadowLayers]) => (
          <ShadowItem key={name} name={name} shadowLayers={shadowLayers} />
        ))}
      </div>
    </div>
  );
};

export const AllShadows: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
            Shadow Tokens
          </h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0, lineHeight: '1.5' }}>
            Elevation and depth effects using box-shadow. Shadows help establish visual hierarchy
            and create depth in the interface.
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
            Use shadow tokens to create elevation and depth. Small shadows for subtle elevation,
            medium for modals and popovers, and large for prominent overlays. Focus and active
            shadows provide interactive feedback.
          </p>
        </div>

        <ShadowGroup
          title="Elevation Shadows"
          description="Standard shadows for cards, modals, and elevated elements"
          shadows={primitiveShadows}
          filter={(name) => name.includes('shadows-')}
        />

        <ShadowGroup
          title="Interactive State Shadows"
          description="Shadows for focus and active states"
          shadows={primitiveShadows}
          filter={(name) => name === 'focus' || name === 'active'}
        />

        <ShadowGroup
          title="Special Shadows"
          description="Context menu and other specialized shadows"
          shadows={primitiveShadows}
          filter={(name) => name === 'contextmenu' || name === 'testshadow'}
        />
      </div>
    );
  },
};

export const ElevationShadows: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Elevation Shadows</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Shadows for creating visual hierarchy through elevation
      </p>
      <ShadowGroup
        title="Shadow Scale"
        description="From small to large elevation"
        shadows={primitiveShadows}
        filter={(name) => name.includes('shadows-')}
      />
    </div>
  ),
};

export const InteractiveShadows: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Interactive Shadows</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Shadows for focus and active states
      </p>
      <ShadowGroup
        title="State Shadows"
        shadows={primitiveShadows}
        filter={(name) => name === 'focus' || name === 'active'}
      />
    </div>
  ),
};

export const ShadowComparison: Story = {
  render: () => {
    const elevationShadows = Object.entries(primitiveShadows).filter(([name]) =>
      name.includes('shadows-')
    );

    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '32px' }}>Shadow Elevation Comparison</h1>

        <div
          style={{
            display: 'flex',
            gap: '32px',
            padding: '60px 40px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {elevationShadows.map(([name, shadowLayers]) => (
            <div
              key={name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: convertShadowToCSS(shadowLayers),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '24px' }}>📦</div>
                <code
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666',
                    fontFamily: 'monospace',
                  }}
                >
                  {name}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const ShadowExamples: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '32px' }}>Shadows in Components</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Card Examples */}
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#1a1a1a' }}>
              Card Elevations
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px',
                padding: '40px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  padding: '24px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: convertShadowToCSS(primitiveShadows['shadows-small']),
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Small Shadow</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                  Subtle elevation for basic cards and panels
                </p>
              </div>
              <div
                style={{
                  padding: '24px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: convertShadowToCSS(primitiveShadows['shadows-medium']),
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Medium Shadow</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                  Standard elevation for modals and dropdowns
                </p>
              </div>
              <div
                style={{
                  padding: '24px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: convertShadowToCSS(primitiveShadows['shadows-large']),
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Large Shadow</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                  Strong elevation for prominent overlays
                </p>
              </div>
            </div>
          </div>

          {/* Button States */}
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#1a1a1a' }}>
              Interactive Button States
            </h3>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                padding: '40px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                flexWrap: 'wrap',
              }}
            >
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0069ff',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Default Button
              </button>
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0069ff',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: convertShadowToCSS(primitiveShadows['focus']),
                }}
              >
                Focused Button
              </button>
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0069ff',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: convertShadowToCSS(primitiveShadows['active']),
                }}
              >
                Active Button
              </button>
            </div>
          </div>

          {/* Dropdown/Menu */}
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#1a1a1a' }}>
              Context Menu Shadow
            </h3>
            <div
              style={{
                padding: '60px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '240px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: convertShadowToCSS(primitiveShadows['contextmenu']),
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '8px 0',
                  }}
                >
                  {['New File', 'Open...', 'Save', 'Save As...', 'Close'].map((item, index) => (
                    <div
                      key={item}
                      style={{
                        padding: '10px 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        borderTop: index === 2 ? '1px solid #e0e0e0' : 'none',
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
