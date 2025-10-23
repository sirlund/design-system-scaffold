import type { Meta, StoryObj } from '@storybook/react';
import { primitiveSpacing, primitiveSize } from '../primitive-tokens/spacing/spacing';
import '../primitive-tokens/spacing/spacing.css';

const meta = {
  title: 'Design Tokens/Spacing',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SpacingItem = ({ name, value }: { name: string; value: string }) => (
  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ flex: '0 0 120px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
      {name}
    </div>
    <div
      style={{
        height: '40px',
        width: value,
        backgroundColor: '#4CAF50',
        borderRadius: '2px',
      }}
    />
    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>
      {value}
    </div>
  </div>
);

export const AllSpacing: Story = {
  render: () => (
    <div>
      <h1>Spacing Tokens</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Primitive spacing tokens generated from Figma.
      </p>
      {Object.entries(primitiveSpacing).map(([name, value]) => (
        <SpacingItem key={name} name={name} value={value} />
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div>
      <h1>Size Tokens</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Primitive size tokens generated from Figma.
      </p>
      {Object.entries(primitiveSize).map(([name, value]) => (
        <SpacingItem key={name} name={name} value={value} />
      ))}
    </div>
  ),
};
