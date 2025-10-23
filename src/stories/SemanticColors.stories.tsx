import type { Meta, StoryObj } from '@storybook/react';
import { primaryColors, textColors, brandColors, systemColors } from '../semantic-tokens/colors/colors';
import '../semantic-tokens/colors/colors.css';

const meta = {
  title: 'Design Tokens/Semantic Colors',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const ColorSwatch = ({ name, value, group }: { name: string; value: string; group: string }) => (
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
        var(--{group}-{name})
      </div>
    </div>
  </div>
);

const ColorGroup = ({
  title,
  colors,
  groupKey
}: {
  title: string;
  colors: Record<string, string>;
  groupKey: string;
}) => (
  <div style={{ marginBottom: '32px' }}>
    <h3 style={{ marginBottom: '16px' }}>{title}</h3>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      {Object.entries(colors).map(([name, value]) => (
        <ColorSwatch key={name} name={name} value={value} group={groupKey} />
      ))}
    </div>
  </div>
);

export const AllSemanticColors: Story = {
  render: () => (
    <div>
      <h1>Semantic Color Tokens</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Semantic color tokens that reference primitive colors. These represent the intent and purpose of colors in your design system.
      </p>
      <ColorGroup title="Primary Colors" colors={primaryColors} groupKey="primary" />
      <ColorGroup title="Text Colors" colors={textColors} groupKey="text" />
      <ColorGroup title="Brand Colors" colors={brandColors} groupKey="brand" />
      <ColorGroup title="System Colors" colors={systemColors} groupKey="system" />
    </div>
  ),
};

export const Primary: Story = {
  render: () => (
    <div>
      <h1>Primary Colors</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Main brand colors used throughout the application.
      </p>
      <ColorGroup title="Primary" colors={primaryColors} groupKey="primary" />
    </div>
  ),
};

export const Text: Story = {
  render: () => (
    <div>
      <h1>Text Colors</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Text colors for different hierarchy levels and states.
      </p>
      <ColorGroup title="Text" colors={textColors} groupKey="text" />
    </div>
  ),
};

export const Brand: Story = {
  render: () => (
    <div>
      <h1>Brand Colors</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Specific brand colors for Treez identity.
      </p>
      <ColorGroup title="Brand" colors={brandColors} groupKey="brand" />
    </div>
  ),
};

export const System: Story = {
  render: () => (
    <div>
      <h1>System Colors</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        System feedback colors for info, success, warning, and error states.
      </p>
      <ColorGroup title="System" colors={systemColors} groupKey="system" />
    </div>
  ),
};
