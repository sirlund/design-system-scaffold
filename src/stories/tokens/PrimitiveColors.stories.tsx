import type { Meta, StoryObj } from '@storybook/react';
import { primitiveColors } from '../../primitive-tokens/colors/colors';

const meta = {
  title: 'Design Tokens/Primitive/Colors',
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
  const isAlpha = name.includes('alpha');

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
          boxShadow: isAlpha ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.05)',
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
  colors: Record<string, string>;
  filter?: (name: string) => boolean;
}

const ColorGroup = ({ title, colors, filter }: ColorGroupProps) => {
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
          marginBottom: '16px',
          color: '#1a1a1a',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredColors.map(([name, value]) => (
          <ColorSwatch key={name} name={name} value={value} />
        ))}
      </div>
    </div>
  );
};

export const AllColors: Story = {
  render: () => {
    const colorGroups = [
      { title: 'Base Colors', filter: (name: string) => name.startsWith('base-') && !name.includes('alpha') && !name.match(/grey|gray/) },
      { title: 'Greys', filter: (name: string) => name.match(/base-grey/) && !name.includes('alpha') },
      { title: 'Alpha Colors - White', filter: (name: string) => name.includes('alpha-white') },
      { title: 'Alpha Colors - Grey', filter: (name: string) => name.includes('alpha-grey') },
      { title: 'Alpha Colors - Black', filter: (name: string) => name.includes('alpha-black') },
    ];

    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
            Primitive Color Tokens
          </h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0, lineHeight: '1.5' }}>
            Foundation colors used throughout the design system. These are the raw color values
            that semantic tokens reference.
          </p>
        </div>

        {colorGroups.map((group) => (
          <ColorGroup
            key={group.title}
            title={group.title}
            colors={primitiveColors}
            filter={group.filter}
          />
        ))}
      </div>
    );
  },
};

export const Blues: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Blue Colors</h1>
      <ColorGroup
        title="Blue Palette"
        colors={primitiveColors}
        filter={(name) => name.includes('blue') && !name.includes('alpha')}
      />
    </div>
  ),
};

export const Greens: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Green Colors</h1>
      <ColorGroup
        title="Green & Jade Palettes"
        colors={primitiveColors}
        filter={(name) => (name.includes('green') || name.includes('jade')) && !name.includes('alpha')}
      />
    </div>
  ),
};

export const Reds: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Red Colors</h1>
      <ColorGroup
        title="Red Palette"
        colors={primitiveColors}
        filter={(name) => name.includes('red') && !name.includes('alpha')}
      />
    </div>
  ),
};

export const AlphaColors: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Alpha Colors</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Semi-transparent colors with varying opacity levels
      </p>
      <ColorGroup
        title="White Alpha"
        colors={primitiveColors}
        filter={(name) => name.includes('alpha-white')}
      />
      <ColorGroup
        title="Grey Alpha"
        colors={primitiveColors}
        filter={(name) => name.includes('alpha-grey')}
      />
      <ColorGroup
        title="Black Alpha"
        colors={primitiveColors}
        filter={(name) => name.includes('alpha-black')}
      />
    </div>
  ),
};
