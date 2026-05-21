'use client';

import type React from 'react';

/**
 * Tiny markdown renderer — handles the subset needed for static legal/sales docs:
 * # / ## / ### headers, **bold**, *italic*, `code`, unordered + ordered lists,
 * blockquotes (>), --- (hr), paragraphs.
 *
 * Used by /dashboard/referral-agreement and /dashboard/documents/call-scripts.
 * Kept tiny + dep-free to avoid pulling in react-markdown + remark plugins for
 * two static pages.
 */
export function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  function pushInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let nodeKey = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
      const codeMatch = remaining.match(/`([^`]+)`/);

      const candidates = [
        boldMatch ? { type: 'b' as const, m: boldMatch } : null,
        italicMatch ? { type: 'i' as const, m: italicMatch } : null,
        codeMatch ? { type: 'c' as const, m: codeMatch } : null,
      ].filter(Boolean) as Array<{ type: 'b' | 'i' | 'c'; m: RegExpMatchArray }>;

      if (candidates.length === 0) {
        parts.push(remaining);
        break;
      }
      candidates.sort((a, b) => (a.m.index ?? 0) - (b.m.index ?? 0));
      const first = candidates[0];
      const idx = first.m.index ?? 0;
      if (idx > 0) parts.push(remaining.slice(0, idx));
      const inner = first.m[1];
      if (first.type === 'b') parts.push(<strong key={nodeKey++}>{inner}</strong>);
      else if (first.type === 'i') parts.push(<em key={nodeKey++}>{inner}</em>);
      else parts.push(<code key={nodeKey++}>{inner}</code>);
      remaining = remaining.slice(idx + first.m[0].length);
    }
    return parts;
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      out.push(<hr key={key++} />);
      i++;
      continue;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      out.push(<h3 key={key++}>{pushInline(trimmed.slice(4))}</h3>);
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      out.push(<h2 key={key++}>{pushInline(trimmed.slice(3))}</h2>);
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      out.push(<h1 key={key++}>{pushInline(trimmed.slice(2))}</h1>);
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoted: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoted.push(lines[i].trim().slice(2));
        i++;
      }
      out.push(<blockquote key={key++}>{pushInline(quoted.join(' '))}</blockquote>);
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      out.push(
        <ul key={key++}>
          {items.map((it, idx) => <li key={idx}>{pushInline(it)}</li>)}
        </ul>,
      );
      continue;
    }

    // Ordered list — only convert when not a section-number-style paragraph (e.g. "1.1")
    if (/^\d+\.\s+/.test(trimmed) && !/^\d+\.\d/.test(trimmed)) {
      const items: string[] = [];
      while (
        i < lines.length &&
        /^\d+\.\s+/.test(lines[i].trim()) &&
        !/^\d+\.\d/.test(lines[i].trim())
      ) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      out.push(
        <ol key={key++}>
          {items.map((it, idx) => <li key={idx}>{pushInline(it)}</li>)}
        </ol>,
      );
      continue;
    }

    // Blank line
    if (trimmed === '') {
      i++;
      continue;
    }

    // Paragraph
    const para: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^---+$/.test(lines[i].trim()) &&
      !/^#{1,3}\s/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('> ') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !(/^\d+\.\s+/.test(lines[i].trim()) && !/^\d+\.\d/.test(lines[i].trim()))
    ) {
      para.push(lines[i].trim());
      i++;
    }
    out.push(<p key={key++}>{pushInline(para.join(' '))}</p>);
  }

  return out;
}
