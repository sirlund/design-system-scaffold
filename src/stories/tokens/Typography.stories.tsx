import type { Meta, StoryObj } from '@storybook/react';
import { semanticTypography } from '../../semantic-tokens/typography/typography';
import { primitiveOther } from '../../primitive-tokens/other/other';

const meta = {
  title: 'Design Tokens/Typography',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface TypographyItemProps {
  name: string;
  value: string;
}

const TypographyItem = ({ name, value }: TypographyItemProps) => {
  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
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
            fontSize: value,
            lineHeight: '1.5',
            color: '#1a1a1a',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
        <div
          style={{
            fontSize: value,
            lineHeight: '1.5',
            color: '#666',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          0123456789 !@#$%^&*()
        </div>
      </div>
    </div>
  );
};

const FontFamilySection = () => {
  const fontFamilies = [
    {
      name: 'type-font-family-default',
      value: primitiveOther['type-font-family-default'],
      description: 'Primary interface font',
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
    {
      name: 'type-font-family-mono',
      value: primitiveOther['type-font-family-mono'],
      description: 'Monospace font for code',
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap',
    },
  ];

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
        Font Families
      </h2>
      {fontFamilies.map((font) => (
        <div
          key={font.name}
          style={{
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            marginBottom: '16px',
          }}
        >
          <link href={font.googleFontUrl} rel="stylesheet" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <code
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#2d2d2d',
                  fontFamily: 'monospace',
                }}
              >
                {font.name}
              </code>
              <code
                style={{
                  fontSize: '12px',
                  color: '#666',
                  fontFamily: 'monospace',
                }}
              >
                {font.value}
              </code>
              <span
                style={{
                  fontSize: '12px',
                  color: '#999',
                  fontStyle: 'italic',
                }}
              >
                {font.description}
              </span>
            </div>

            {/* Font samples at different sizes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  fontFamily: font.value,
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '400',
                  color: '#2d2d2d',
                  fontFamily: font.value,
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#666',
                  fontFamily: font.value,
                }}
              >
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#666',
                  fontFamily: font.value,
                }}
              >
                0123456789 !@#$%^&*()_+-=[]{}|;':",./&lt;&gt;?
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TypographyComparison = () => {
  const sizes = Object.entries(semanticTypography);

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
        Size Comparison
      </h2>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '16px',
          padding: '32px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          flexWrap: 'wrap',
        }}
      >
        {sizes.map(([name, value]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: value,
                fontWeight: '600',
                color: '#1a1a1a',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              Aa
            </div>
            <code
              style={{
                fontSize: '11px',
                color: '#666',
                fontFamily: 'monospace',
              }}
            >
              {name.replace('type-font-size-', '')}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AllTypography: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
            Typography Tokens
          </h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0, lineHeight: '1.5' }}>
            Font family and size tokens for consistent typography hierarchy throughout the design system.
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
            These typography tokens include font families (Inter for UI, Fira Code for code) and font sizes
            that should be combined with appropriate line-height and font-weight values for optimal readability.
          </p>
        </div>

        <FontFamilySection />

        <TypographyComparison />

        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#1a1a1a',
            }}
          >
            Typography Examples
          </h2>
          {Object.entries(semanticTypography).map(([name, value]) => (
            <TypographyItem key={name} name={name} value={value} />
          ))}
        </div>
      </div>
    );
  },
};

export const TypographyHierarchy: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '32px' }}>Typography Hierarchy</h1>

        <div
          style={{
            padding: '32px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          <h1 style={{ fontSize: semanticTypography['type-font-size-xl'], marginBottom: '16px' }}>
            Extra Large Heading (XL - 24px)
          </h1>
          <h2 style={{ fontSize: semanticTypography['type-font-size-l'], marginBottom: '16px' }}>
            Large Heading (L - 20px)
          </h2>
          <h3 style={{ fontSize: semanticTypography['type-font-size-m'], marginBottom: '16px' }}>
            Medium - Body Text (M - 16px)
          </h3>
          <p style={{ fontSize: semanticTypography['type-font-size-s'], marginBottom: '16px' }}>
            Small - Secondary Text (S - 14px) - This is commonly used for body text, descriptions,
            and secondary information.
          </p>
          <p style={{ fontSize: semanticTypography['type-font-size-xs'], marginBottom: 0 }}>
            Extra Small - Captions (XS - 12px) - Used for captions, labels, and tertiary
            information.
          </p>
        </div>
      </div>
    );
  },
};

export const RealWorldExamples: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '32px' }}>Real World Examples</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card Example */}
          <div
            style={{
              padding: '24px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <h3
              style={{
                fontSize: semanticTypography['type-font-size-l'],
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1a1a1a',
              }}
            >
              Card Title (Large)
            </h3>
            <p
              style={{
                fontSize: semanticTypography['type-font-size-s'],
                color: '#666',
                marginBottom: '16px',
                lineHeight: '1.5',
              }}
            >
              This is the card description using small text. It provides additional context and
              information about the card content.
            </p>
            <div
              style={{
                fontSize: semanticTypography['type-font-size-xs'],
                color: '#999',
              }}
            >
              Last updated: 2 hours ago
            </div>
          </div>

          {/* Form Example */}
          <div
            style={{
              padding: '24px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <h3
              style={{
                fontSize: semanticTypography['type-font-size-l'],
                fontWeight: '600',
                marginBottom: '16px',
                color: '#1a1a1a',
              }}
            >
              Form Example
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: semanticTypography['type-font-size-s'],
                  fontWeight: '600',
                  marginBottom: '4px',
                  color: '#2d2d2d',
                }}
              >
                Email Address
              </label>
              <div
                style={{
                  fontSize: semanticTypography['type-font-size-m'],
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                user@example.com
              </div>
              <div
                style={{
                  fontSize: semanticTypography['type-font-size-xs'],
                  color: '#666',
                  marginTop: '4px',
                }}
              >
                We'll never share your email with anyone else.
              </div>
            </div>
          </div>

          {/* Article Example */}
          <div
            style={{
              padding: '32px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <h1
              style={{
                fontSize: semanticTypography['type-font-size-xl'],
                fontWeight: '700',
                marginBottom: '8px',
                color: '#1a1a1a',
              }}
            >
              Article Heading (Extra Large)
            </h1>
            <div
              style={{
                fontSize: semanticTypography['type-font-size-xs'],
                color: '#999',
                marginBottom: '16px',
              }}
            >
              Published on October 23, 2025 by Design System Team
            </div>
            <p
              style={{
                fontSize: semanticTypography['type-font-size-m'],
                color: '#2d2d2d',
                lineHeight: '1.6',
                marginBottom: '16px',
              }}
            >
              This is the article body text using medium size. It provides a comfortable reading
              experience with good readability. The medium size is perfect for longer form content
              where users need to read multiple paragraphs.
            </p>
            <p
              style={{
                fontSize: semanticTypography['type-font-size-m'],
                color: '#2d2d2d',
                lineHeight: '1.6',
                marginBottom: 0,
              }}
            >
              Typography is one of the most important aspects of design systems, ensuring
              consistency and hierarchy across all interfaces.
            </p>
          </div>
        </div>
      </div>
    );
  },
};
