import type { Meta, StoryObj } from '@storybook/react';
import {
  brandColors,
  componentColors,
  feedbackColors,
  surfaceColors,
  textColors,
  borderColors,
} from '../design-tokens/semantic-colors';
import '../design-tokens/semantic-colors.css';
import '../figma-tokens/colors/colors.css';

const meta = {
  title: 'Semantic Tokens/Colors',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const ColorSwatch = ({ name, value, cssVar }: { name: string; value: string; cssVar: string }) => (
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
      <div style={{ color: '#999', fontSize: '11px' }}>var({cssVar})</div>
    </div>
  </div>
);

const ColorGroup = ({
  title,
  description,
  colors,
  cssPrefix,
}: {
  title: string;
  description: string;
  colors: Record<string, string>;
  cssPrefix: string;
}) => (
  <div style={{ marginBottom: '32px' }}>
    <h3>{title}</h3>
    <p style={{ color: '#666', marginBottom: '16px' }}>{description}</p>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      {Object.entries(colors).map(([name, value]) => (
        <ColorSwatch
          key={name}
          name={name}
          value={value}
          cssVar={`--${cssPrefix}-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
        />
      ))}
    </div>
  </div>
);

export const BrandColors: Story = {
  render: () => (
    <div>
      <h1>Brand Colors</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Core brand identity colors. Use these for primary and secondary brand expressions.
      </p>
      <ColorGroup
        title="Brand Palette"
        description="Primary and secondary brand colors with light and dark variants"
        colors={brandColors}
        cssPrefix="brand"
      />
    </div>
  ),
};

export const ComponentColors: Story = {
  render: () => (
    <div>
      <h1>Component Colors</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Colors for interactive elements like buttons, inputs, and links. These provide consistent
        interaction patterns.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {Object.entries(componentColors).map(([name, value]) => (
          <ColorSwatch
            key={name}
            name={name}
            value={value}
            cssVar={`--${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  ),
};

export const FeedbackColors: Story = {
  render: () => (
    <div>
      <h1>Feedback Colors</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Colors for status and feedback messages. Use these to communicate success, error, warning,
        and informational states.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {Object.entries(feedbackColors).map(([name, value]) => (
          <ColorSwatch
            key={name}
            name={name}
            value={value}
            cssVar={`--${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  ),
};

export const SurfaceColors: Story = {
  render: () => (
    <div>
      <h1>Surface Colors</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Colors for backgrounds, surfaces, and dividers. Use these to create visual hierarchy and
        separation.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {Object.entries(surfaceColors).map(([name, value]) => (
          <ColorSwatch
            key={name}
            name={name}
            value={value}
            cssVar={`--surface-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  ),
};

export const TextColors: Story = {
  render: () => (
    <div>
      <h1>Text Colors</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Colors for typography. Use these to create a clear text hierarchy.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {Object.entries(textColors).map(([name, value]) => (
          <ColorSwatch
            key={name}
            name={name}
            value={value}
            cssVar={`--text-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  ),
};

export const BorderColors: Story = {
  render: () => (
    <div>
      <h1>Border Colors</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Colors for borders and dividers. Use these for component outlines and separators.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {Object.entries(borderColors).map(([name, value]) => (
          <ColorSwatch
            key={name}
            name={name}
            value={value}
            cssVar={`--border-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  ),
};

export const AllSemanticColors: Story = {
  render: () => (
    <div>
      <h1>Semantic Color Tokens</h1>
      <p style={{ color: '#666', marginBottom: '32px', maxWidth: '800px' }}>
        Semantic tokens provide the <strong>PUBLIC API</strong> for your design system. Unlike
        primitive tokens (green-01, grey-05, etc.), semantic tokens are named by their
        <strong> purpose and intent</strong>. Use these in your components instead of primitives.
      </p>

      <ColorGroup
        title="Brand Colors"
        description="Core brand identity colors"
        colors={brandColors}
        cssPrefix="brand"
      />

      <div style={{ marginBottom: '32px' }}>
        <h3>Component Colors</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Colors for interactive elements like buttons, inputs, and links
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {Object.entries(componentColors).map(([name, value]) => (
            <ColorSwatch
              key={name}
              name={name}
              value={value}
              cssVar={`--${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3>Feedback Colors</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Colors for status and feedback messages
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {Object.entries(feedbackColors).map(([name, value]) => (
            <ColorSwatch
              key={name}
              name={name}
              value={value}
              cssVar={`--${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3>Surface Colors</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>Colors for backgrounds and surfaces</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {Object.entries(surfaceColors).map(([name, value]) => (
            <ColorSwatch
              key={name}
              name={name}
              value={value}
              cssVar={`--surface-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3>Text Colors</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>Colors for typography</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {Object.entries(textColors).map(([name, value]) => (
            <ColorSwatch
              key={name}
              name={name}
              value={value}
              cssVar={`--text-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3>Border Colors</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>Colors for borders and dividers</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {Object.entries(borderColors).map(([name, value]) => (
            <ColorSwatch
              key={name}
              name={name}
              value={value}
              cssVar={`--border-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
            />
          ))}
        </div>
      </div>
    </div>
  ),
};
