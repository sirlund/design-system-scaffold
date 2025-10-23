/**
 * Onboarding Message Component
 *
 * Shown when expected content (tokens/components) doesn't exist yet.
 * Provides helpful guidance to get users started.
 */

interface OnboardingMessageProps {
  type: 'primitive-colors' | 'semantic-colors' | 'spacing' | 'radius' | 'components';
  title?: string;
}

export const OnboardingMessage = ({ type, title }: OnboardingMessageProps) => {
  const messages = {
    'primitive-colors': {
      title: title || '🎨 Primitive Color Tokens',
      description: 'Primitive color tokens are the foundation of your design system.',
      command: '/tokens-from-figma https://figma.com/file/YOUR_FILE_ID',
      whatYouGet: [
        'All colors from your Figma file',
        'Organized by color family (green, blue, etc.)',
        'CSS variables for each color',
        'TypeScript definitions',
      ],
    },
    'semantic-colors': {
      title: title || '🎨 Semantic Color Tokens',
      description: 'Semantic colors represent the purpose and intent of colors in your UI.',
      command: '/tokens-from-figma https://figma.com/file/YOUR_FILE_ID',
      whatYouGet: [
        'Intent-based color names (primary, text, success)',
        'References to primitive colors',
        'Industry-standard naming (category-first)',
        'Easy to update across your app',
      ],
    },
    'spacing': {
      title: title || '📏 Spacing Tokens',
      description: 'Spacing tokens create consistent layout and visual rhythm.',
      command: '/tokens-from-figma https://figma.com/file/YOUR_FILE_ID',
      whatYouGet: [
        'All spacing values from Figma',
        'Consistent margins and padding',
        'CSS variables',
        'TypeScript definitions',
      ],
    },
    'radius': {
      title: title || '⭕ Radius Tokens',
      description: 'Border radius tokens for consistent rounded corners.',
      command: '/tokens-from-figma https://figma.com/file/YOUR_FILE_ID',
      whatYouGet: [
        'All border radius values',
        'Consistent rounded corners',
        'CSS variables',
        'TypeScript definitions',
      ],
    },
    'components': {
      title: title || '🧩 Components',
      description: 'React components built from your Figma designs.',
      command: '/component-from-figma button',
      whatYouGet: [
        'TypeScript React components',
        'CSS Modules with token references',
        'Full type safety',
        'Storybook stories',
      ],
    },
  };

  const config = messages[type];

  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '60px auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>{config.title}</h1>

      <div
        style={{
          background: '#fff3cd',
          padding: '24px',
          borderRadius: '8px',
          border: '2px solid #ffc107',
          marginBottom: '32px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>
          ⚠️ Content not yet generated
        </h3>
        <p style={{ margin: '0 0 16px 0', color: '#856404', lineHeight: '1.6' }}>
          {config.description}
        </p>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
          Run this command to generate:
        </p>
        <code
          style={{
            background: '#fff',
            padding: '12px 16px',
            borderRadius: '4px',
            display: 'block',
            fontFamily: 'monospace',
            fontSize: '13px',
            border: '1px solid #ffc107',
          }}
        >
          {config.command}
        </code>
      </div>

      <div
        style={{
          background: '#f5f5f5',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '32px',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
          What you'll get:
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
          {config.whatYouGet.map((item, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ background: '#e7f3ff', padding: '20px', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>💡 Quick Tip</h4>
        <p style={{ margin: 0, fontSize: '14px', color: '#004085', lineHeight: '1.6' }}>
          This design system scaffold uses AI agents to automatically generate code from your Figma
          files. Once you run the command above, this page will automatically show your content!
        </p>
      </div>

      <div
        style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #ddd',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>
          Need help? Check the{' '}
          <a
            href="https://github.com/anthropics/claude-code"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0066cc' }}
          >
            documentation
          </a>{' '}
          or read the <code style={{ background: '#f5f5f5', padding: '2px 6px' }}>README.md</code>
        </p>
      </div>
    </div>
  );
};
