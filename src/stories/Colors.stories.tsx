import type { Meta, StoryObj } from '@storybook/react';
import { primitiveColors } from '../primitive-tokens/colors/colors';
import '../primitive-tokens/colors/colors.css';

const meta = {
  title: 'Design Tokens/Colors',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Group colors by family
const colorGroups = Object.keys(primitiveColors).reduce((groups, key) => {
  const family = key.split('-')[0];
  if (!groups[family]) {
    groups[family] = {};
  }
  groups[family][key] = primitiveColors[key as keyof typeof primitiveColors];
  return groups;
}, {} as Record<string, Record<string, string>>);

const ColorSwatch = ({ name, value }: { name: string; value: string }) => (
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
      <div style={{ color: '#999', fontSize: '11px' }}>
        var(--primitive-{name})
      </div>
    </div>
  </div>
);

const ColorGroup = ({ title, colors }: { title: string; colors: Record<string, string> }) => (
  <div style={{ marginBottom: '32px' }}>
    <h3 style={{ textTransform: 'capitalize', marginBottom: '16px' }}>{title}</h3>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      {Object.entries(colors).map(([name, value]) => (
        <ColorSwatch key={name} name={name} value={value} />
      ))}
    </div>
  </div>
);

export const AllColors: Story = {
  render: () => (
    <div>
      <h1>Color Tokens</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Primitive color tokens generated from Figma. Use these to create semantic tokens.
      </p>
      {Object.entries(colorGroups).map(([family, colors]) => (
        <ColorGroup key={family} title={family} colors={colors} />
      ))}
    </div>
  ),
};
