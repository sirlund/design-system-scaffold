import type { Meta, StoryObj } from '@storybook/react';
import { primitiveRadius } from '../primitive-tokens/radius/radius';
import '../primitive-tokens/radius/radius.css';

const meta = {
  title: 'Design Tokens/Radius',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const RadiusItem = ({ name, value }: { name: string; value: string }) => (
  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ flex: '0 0 120px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
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
    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>
      {value}
    </div>
  </div>
);

export const AllRadius: Story = {
  render: () => (
    <div>
      <h1>Radius Tokens</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Primitive radius tokens generated from Figma.
      </p>
      {Object.entries(primitiveRadius).map(([name, value]) => (
        <RadiusItem key={name} name={name} value={value} />
      ))}
    </div>
  ),
};
