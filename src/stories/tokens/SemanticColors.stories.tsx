import type { Meta, StoryObj } from '@storybook/react';
import { semanticColors } from '../../semantic-tokens/colors/colors';

const meta = {
  title: 'Design Tokens/Semantic/Colors',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface ColorSwatchProps {
  name: string;
  value: string;
  category?: string;
}

const ColorSwatch = ({ name, value, category }: ColorSwatchProps) => {
  const isAlpha = name.includes('alpha') || value.includes('99') || value.includes('d9');
  const isDark = name.includes('inverted') || name.includes('on-inverted');

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
          background: isAlpha
            ? `linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
               linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
               ${value}`
            : value,
          backgroundSize: isAlpha ? '20px 20px, 20px 20px, 100% 100%' : 'auto',
          backgroundPosition: isAlpha ? '0 0, 10px 10px, 0 0' : 'center',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {category && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: '600',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {category}
          </span>
        )}
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

interface ColorGroupProps {
  title: string;
  description?: string;
  colors: Record<string, string>;
  filter?: (name: string) => boolean;
  category?: string;
}

const ColorGroup = ({ title, description, colors, filter, category }: ColorGroupProps) => {
  const filteredColors = Object.entries(colors).filter(([name]) =>
    filter ? filter(name) : true
  );

  if (filteredColors.length === 0) return null;

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
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredColors.map(([name, value]) => (
          <ColorSwatch key={name} name={name} value={value} category={category} />
        ))}
      </div>
    </div>
  );
};

export const AllSemanticColors: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
            Semantic Color Tokens
          </h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0, lineHeight: '1.5' }}>
            Purpose-driven colors that convey meaning and intent in the UI. These tokens reference
            primitive colors and should be used in components.
          </p>
        </div>

        <ColorGroup
          title="Primary Colors"
          description="Main brand colors and their variations"
          colors={semanticColors}
          filter={(name) => name.startsWith('system-primary')}
          category="System"
        />

        <ColorGroup
          title="Accent Colors"
          description="Interactive elements and emphasis"
          colors={semanticColors}
          filter={(name) => name.startsWith('system-accent')}
          category="System"
        />

        <ColorGroup
          title="Content Colors"
          description="Text and icon colors for different contexts"
          colors={semanticColors}
          filter={(name) => name.startsWith('system-content') && !name.includes('on-inverted')}
          category="Content"
        />

        <ColorGroup
          title="Content on Inverted Backgrounds"
          description="Text and icon colors for dark backgrounds"
          colors={semanticColors}
          filter={(name) => name.includes('content-on-inverted')}
          category="Content"
        />

        <ColorGroup
          title="Surface Colors"
          description="Background and layer colors"
          colors={semanticColors}
          filter={(name) => name.startsWith('system-surface')}
          category="Surface"
        />

        <ColorGroup
          title="Stroke Colors"
          description="Border and divider colors"
          colors={semanticColors}
          filter={(name) => name.startsWith('system-stroke')}
          category="Stroke"
        />

        <ColorGroup
          title="Build Colors"
          description="Special purpose colors for workflows and UI elements"
          colors={semanticColors}
          filter={(name) => name.startsWith('system-build')}
          category="Build"
        />

        <ColorGroup
          title="Icon Colors"
          description="Icon-specific color tokens"
          colors={semanticColors}
          filter={(name) => name.startsWith('system-icon') && !name.includes('on-inverted')}
          category="Icon"
        />

        <ColorGroup
          title="Icons on Inverted Backgrounds"
          description="Icon colors for dark backgrounds"
          colors={semanticColors}
          filter={(name) => name.startsWith('system-icon') && name.includes('on-inverted')}
          category="Icon"
        />

        <ColorGroup
          title="Feedback Colors"
          description="Status and notification colors"
          colors={semanticColors}
          filter={(name) => name.startsWith('feedback')}
          category="Feedback"
        />
      </div>
    );
  },
};

export const PrimaryAndAccent: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Primary & Accent Colors</h1>
      <ColorGroup
        title="Primary"
        colors={semanticColors}
        filter={(name) => name.startsWith('system-primary')}
      />
      <ColorGroup
        title="Accent"
        colors={semanticColors}
        filter={(name) => name.startsWith('system-accent')}
      />
    </div>
  ),
};

export const ContentColors: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Content Colors</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Text and icon colors optimized for readability
      </p>
      <ColorGroup
        title="Standard Content"
        colors={semanticColors}
        filter={(name) => name.startsWith('system-content') && !name.includes('on-inverted')}
      />
      <ColorGroup
        title="On Inverted Backgrounds"
        colors={semanticColors}
        filter={(name) => name.includes('content-on-inverted')}
      />
    </div>
  ),
};

export const FeedbackColors: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Feedback Colors</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Colors for error, warning, and success states
      </p>
      <ColorGroup
        title="Negative (Error)"
        colors={semanticColors}
        filter={(name) => name.includes('feedback-negative')}
      />
      <ColorGroup
        title="Warning"
        colors={semanticColors}
        filter={(name) => name.includes('feedback-warning')}
      />
      <ColorGroup
        title="Positive (Success)"
        colors={semanticColors}
        filter={(name) => name.includes('feedback-positive')}
      />
    </div>
  ),
};

export const SurfaceAndStroke: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Surface & Stroke Colors</h1>
      <ColorGroup
        title="Surfaces"
        description="Backgrounds and layers"
        colors={semanticColors}
        filter={(name) => name.startsWith('system-surface')}
      />
      <ColorGroup
        title="Strokes"
        description="Borders and dividers"
        colors={semanticColors}
        filter={(name) => name.startsWith('system-stroke')}
      />
    </div>
  ),
};
