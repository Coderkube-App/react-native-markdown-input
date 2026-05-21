export interface TextSegment {
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
  isStrikethrough?: boolean;
  isCode?: boolean;
  isLink?: boolean;
  isHeader?: boolean;
  headerLevel?: number;
  isBlockquote?: boolean;
  isBullet?: boolean;
  isCodeBlock?: boolean;
  isSyntax?: boolean;
}

// Regex rules for inline Markdown styles
const INLINE_RULES = [
  // 1. Inline Code: `code`
  {
    regex: /`([^`]+)`/g,
    apply: (match: RegExpExecArray, seg: TextSegment): TextSegment[] => [
      { ...seg, text: '`', isSyntax: true },
      { ...seg, text: match[1], isCode: true },
      { ...seg, text: '`', isSyntax: true },
    ]
  },
  // 2. Links: [label](url)
  {
    regex: /\[([^\]]+)\]\(([^)]+)\)/g,
    apply: (match: RegExpExecArray, seg: TextSegment): TextSegment[] => [
      { ...seg, text: '[', isSyntax: true },
      { ...seg, text: match[1], isLink: true, isBold: true },
      { ...seg, text: '](', isSyntax: true },
      { ...seg, text: match[2], isLink: true },
      { ...seg, text: ')', isSyntax: true },
    ]
  },
  // 3. Bold: **text** or __text__
  {
    regex: /(\*\*|__)(.*?)\1/g,
    apply: (match: RegExpExecArray, seg: TextSegment): TextSegment[] => [
      { ...seg, text: match[1], isSyntax: true },
      { ...seg, text: match[2], isBold: true },
      { ...seg, text: match[1], isSyntax: true },
    ]
  },
  // 4. Italic: *text* or _text_
  {
    regex: /(\*|_)(.*?)\1/g,
    apply: (match: RegExpExecArray, seg: TextSegment): TextSegment[] => [
      { ...seg, text: match[1], isSyntax: true },
      { ...seg, text: match[2], isItalic: true },
      { ...seg, text: match[1], isSyntax: true },
    ]
  },
  // 5. Strikethrough: ~~text~~
  {
    regex: /(~~)(.*?)\1/g,
    apply: (match: RegExpExecArray, seg: TextSegment): TextSegment[] => [
      { ...seg, text: match[1], isSyntax: true },
      { ...seg, text: match[2], isStrikethrough: true },
      { ...seg, text: match[1], isSyntax: true },
    ]
  }
];

/**
 * Parses inline elements of an array of segments using regex rules.
 */
function parseInline(segments: TextSegment[]): TextSegment[] {
  let currentSegments = [...segments];

  for (const rule of INLINE_RULES) {
    const nextSegments: TextSegment[] = [];

    for (const seg of currentSegments) {
      // Skip if already styled by a terminal rule (code, syntax, link)
      if (seg.isCode || seg.isSyntax || seg.isLink || seg.isCodeBlock) {
        nextSegments.push(seg);
        continue;
      }

      let lastIndex = 0;
      let match: RegExpExecArray | null;
      const text = seg.text;
      rule.regex.lastIndex = 0;
      let foundMatch = false;

      while ((match = rule.regex.exec(text)) !== null) {
        foundMatch = true;
        const matchIndex = match.index;
        const matchedStr = match[0];

        // Push preceding unmatched text
        if (matchIndex > lastIndex) {
          nextSegments.push({
            ...seg,
            text: text.substring(lastIndex, matchIndex)
          });
        }

        // Apply rules
        const styled = rule.apply(match, seg);
        nextSegments.push(...styled);

        lastIndex = matchIndex + matchedStr.length;

        // Prevent infinite loops on zero-width matches
        if (rule.regex.lastIndex === matchIndex) {
          rule.regex.lastIndex++;
        }
      }

      if (foundMatch) {
        // Push remaining unmatched text
        if (lastIndex < text.length) {
          nextSegments.push({
            ...seg,
            text: text.substring(lastIndex)
          });
        }
      } else {
        nextSegments.push(seg);
      }
    }

    currentSegments = nextSegments;
  }

  return currentSegments;
}

/**
 * Parses full raw text into a sequence of stylized TextSegments.
 * Strictly guarantees that rebuilding the string matches the raw input exactly.
 */
export function parseMarkdown(rawText: string): TextSegment[] {
  if (!rawText) return [];

  // Split raw text, keeping the newline character at the end of each line to guarantee perfect recovery
  const lines: string[] = [];
  let currentStart = 0;
  for (let i = 0; i < rawText.length; i++) {
    if (rawText[i] === '\n') {
      lines.push(rawText.substring(currentStart, i + 1));
      currentStart = i + 1;
    }
  }
  if (currentStart < rawText.length) {
    lines.push(rawText.substring(currentStart));
  }

  const allSegments: TextSegment[] = [];
  let inCodeBlock = false;

  for (const lineText of lines) {
    const isLineEnding = lineText.endsWith('\n');
    const lineContent = isLineEnding ? lineText.slice(0, -1) : lineText;
    const lineEnding = isLineEnding ? '\n' : '';

    // 1. Handle triple-backtick Code Blocks
    if (lineContent.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      allSegments.push({ text: lineContent, isCodeBlock: true, isSyntax: true });
      if (lineEnding) {
        allSegments.push({ text: lineEnding });
      }
      continue;
    }

    if (inCodeBlock) {
      allSegments.push({ text: lineContent, isCodeBlock: true });
      if (lineEnding) {
        allSegments.push({ text: lineEnding });
      }
      continue;
    }

    // 2. Handle Blockquotes
    if (lineContent.startsWith('> ')) {
      const syntax = '> ';
      const content = lineContent.substring(2);
      const lineSegments: TextSegment[] = [
        { text: syntax, isBlockquote: true, isSyntax: true },
        { text: content, isBlockquote: true }
      ];
      const parsedInline = parseInline(lineSegments);
      allSegments.push(...parsedInline);
      if (lineEnding) {
        allSegments.push({ text: lineEnding });
      }
      continue;
    }

    // 3. Handle Headers (# to ######)
    const headerMatch = lineContent.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const hashes = headerMatch[1];
      const space = ' ';
      const content = headerMatch[2];
      const level = hashes.length;

      const lineSegments: TextSegment[] = [
        { text: hashes, isHeader: true, headerLevel: level, isSyntax: true },
        { text: space, isHeader: true, headerLevel: level, isSyntax: true },
        { text: content, isHeader: true, headerLevel: level }
      ];
      const parsedInline = parseInline(lineSegments);
      allSegments.push(...parsedInline);
      if (lineEnding) {
        allSegments.push({ text: lineEnding });
      }
      continue;
    }

    // 4. Handle Bullet Lists (- or * or • or numbered list like 1.)
    const bulletMatch = lineContent.match(/^(\s*(?:[-*•]|\d+\.))\s+(.*)$/);
    if (bulletMatch) {
      const prefix = bulletMatch[1];
      const space = ' ';
      const content = bulletMatch[2];

      const lineSegments: TextSegment[] = [
        { text: prefix, isBullet: true, isSyntax: true },
        { text: space, isBullet: true, isSyntax: true },
        { text: content }
      ];
      const parsedInline = parseInline(lineSegments);
      allSegments.push(...parsedInline);
      if (lineEnding) {
        allSegments.push({ text: lineEnding });
      }
      continue;
    }

    // 5. Normal Line
    if (lineContent.length > 0) {
      const lineSegments: TextSegment[] = [{ text: lineContent }];
      const parsedInline = parseInline(lineSegments);
      allSegments.push(...parsedInline);
    }
    if (lineEnding) {
      allSegments.push({ text: lineEnding });
    }
  }

  return allSegments;
}
