import React from 'react';

const MarkdownRenderer = ({ content }) => {
  // Simple markdown parsing - handles basic formatting
  const renderText = (text) => {
    if (!text) return null;

    // Split into lines for paragraph handling
    const lines = text.split('\n\n');

    return lines.map((line, lineIndex) => {
      // Handle code blocks
      if (line.startsWith('```') && line.endsWith('```')) {
        const codeContent = line.slice(3, -3);
        return (
          <pre key={lineIndex} className="code-block">
            <code>{codeContent}</code>
          </pre>
        );
      }

      // Handle inline code
      const withInlineCode = line.replace(/`([^`]+)`/g, '<code>$1</code>');

      // Handle bold
      const withBold = withInlineCode.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      // Handle italics
      const withItalic = withBold.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Handle links
      const withLinks = withItalic.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

      // Handle unordered lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const items = line.split('\n').map((item, idx) => {
          const content = item.replace(/^[-*]\s+/, '');
          return <li key={idx}>{renderText(content)}</li>;
        });
        return <ul key={lineIndex}>{items}</ul>;
      }

      // Handle ordered lists
      if (/^\d+\.\s/.test(line)) {
        const items = line.split('\n').map((item, idx) => {
          const content = item.replace(/^\d+\.\s+/, '');
          return <li key={idx}>{renderText(content)}</li>;
        });
        return <ol key={lineIndex}>{items}</ol>;
      }

      // Handle headers
      if (line.startsWith('### ')) {
        return <h4 key={lineIndex}>{line.slice(4)}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={lineIndex}>{line.slice(3)}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={lineIndex}>{line.slice(2)}</h2>;
      }

      // Regular paragraph
      return (
        <p
          key={lineIndex}
          dangerouslySetInnerHTML={{ __html: withLinks }}
        />
      );
    });
  };

  return <div className="markdown-content">{renderText(content)}</div>;
};

export default MarkdownRenderer;
