/**
 * Utility functions to convert raw markdown or plain text to clean, eye-pleasing HTML
 * for the Word-like text editor and document readers (without showing raw markdown symbols).
 */

export const markdownToFormattedHtml = (text: string): string => {
  if (!text) return '<p>Start typing your document text here...</p>';

  // If already contains structured HTML paragraphs or headings, return clean
  if (
    text.includes('<p>') ||
    text.includes('<h1>') ||
    text.includes('<h2>') ||
    text.includes('<h3>') ||
    text.includes('<ul>') ||
    text.includes('<ol>') ||
    text.includes('<blockquote>')
  ) {
    return text;
  }

  const lines = text.split('\n');
  const result: string[] = [];
  let inBulletList = false;
  let inNumberedList = false;

  const parseInlineStyles = (str: string): string => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-indigo-300 px-1 py-0.5 rounded font-mono text-xs">$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (inBulletList) {
        result.push('</ul>');
        inBulletList = false;
      }
      if (inNumberedList) {
        result.push('</ol>');
        inNumberedList = false;
      }
      result.push('<p><br></p>');
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      if (inBulletList) { result.push('</ul>'); inBulletList = false; }
      if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
      const content = parseInlineStyles(trimmed.replace(/^#\s+/, ''));
      result.push(`<h1 class="text-xl sm:text-2xl font-bold text-white mb-2">${content}</h1>`);
      continue;
    }

    if (trimmed.startsWith('## ')) {
      if (inBulletList) { result.push('</ul>'); inBulletList = false; }
      if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
      const content = parseInlineStyles(trimmed.replace(/^##\s+/, ''));
      result.push(`<h2 class="text-lg sm:text-xl font-bold text-indigo-300 mb-1.5 mt-3">${content}</h2>`);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      if (inBulletList) { result.push('</ul>'); inBulletList = false; }
      if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
      const content = parseInlineStyles(trimmed.replace(/^###\s+/, ''));
      result.push(`<h3 class="text-base font-semibold text-purple-300 mb-1 mt-2">${content}</h3>`);
      continue;
    }

    // Bullet Lists (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
      if (!inBulletList) {
        result.push('<ul class="list-disc pl-5 space-y-1 text-slate-200">');
        inBulletList = true;
      }
      const itemContent = parseInlineStyles(trimmed.replace(/^[-*]\s+/, ''));
      result.push(`<li>${itemContent}</li>`);
      continue;
    }

    // Numbered Lists (1., 2.)
    if (/^\d+\.\s+/.test(trimmed)) {
      if (inBulletList) { result.push('</ul>'); inBulletList = false; }
      if (!inNumberedList) {
        result.push('<ol class="list-decimal pl-5 space-y-1 text-slate-200">');
        inNumberedList = true;
      }
      const itemContent = parseInlineStyles(trimmed.replace(/^\d+\.\s+/, ''));
      result.push(`<li>${itemContent}</li>`);
      continue;
    }

    // Quotes
    if (trimmed.startsWith('> ')) {
      if (inBulletList) { result.push('</ul>'); inBulletList = false; }
      if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
      const quoteContent = parseInlineStyles(trimmed.replace(/^>\s+/, ''));
      result.push(`<blockquote class="border-l-4 border-indigo-500 pl-3 py-1 my-2 text-slate-300 italic bg-indigo-950/20 rounded-r-lg">${quoteContent}</blockquote>`);
      continue;
    }

    // Standard text paragraph
    if (inBulletList) { result.push('</ul>'); inBulletList = false; }
    if (inNumberedList) { result.push('</ol>'); inNumberedList = false; }
    const pContent = parseInlineStyles(trimmed);
    result.push(`<p class="text-slate-200 leading-relaxed">${pContent}</p>`);
  }

  if (inBulletList) result.push('</ul>');
  if (inNumberedList) result.push('</ol>');

  return result.join('');
};

/**
 * Strips all raw markdown and HTML formatting tags for clean text snippets and previews.
 */
export const stripFormattingForSnippet = (text: string, maxLength: number = 120): string => {
  if (!text) return '';
  const clean = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength) + '...';
};
