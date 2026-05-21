import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TextStyle,
  Platform,
} from 'react-native';
import { parseMarkdown, TextSegment } from './MarkdownRules';

export interface MarkdownStyles {
  bold?: TextStyle;
  italic?: TextStyle;
  strikethrough?: TextStyle;
  code?: TextStyle;
  link?: TextStyle;
  blockquote?: TextStyle;
  bullet?: TextStyle;
  codeblock?: TextStyle;
  syntax?: TextStyle;
  header1?: TextStyle;
  header2?: TextStyle;
  header3?: TextStyle;
  header4?: TextStyle;
  header5?: TextStyle;
  header6?: TextStyle;
}

export interface MarkdownInputProps extends Omit<TextInputProps, 'children'> {
  value: string;
  onChangeText: (text: string) => void;
  theme?: 'dark' | 'light';
  markdownStyles?: MarkdownStyles;
  onMarkdownParse?: (segments: TextSegment[]) => void;
}

const MarkdownInputComponent: React.ForwardRefRenderFunction<TextInput, MarkdownInputProps> = (
  {
    value,
    onChangeText,
    theme = 'dark',
    markdownStyles,
    style,
    multiline = true,
    onMarkdownParse,
    ...props
  },
  ref
) => {
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => inputRef.current as TextInput);

  // Parse markdown into tokens
  const segments = React.useMemo(() => parseMarkdown(value), [value]);

  // Trigger optional callback for custom statistics, counts, or previews
  React.useEffect(() => {
    if (onMarkdownParse) {
      onMarkdownParse(segments);
    }
  }, [segments, onMarkdownParse]);

  // Get active styling based on theme
  const activeStyles = theme === 'dark' ? darkThemeStyles : lightThemeStyles;

  // Render a parsed Segment as formatted Text
  const renderSegment = (seg: TextSegment, index: number) => {
    const textStyle: TextStyle[] = [];

    // Apply Base Style
    textStyle.push(activeStyles.baseText);

    // Apply Inline Markdown Styles
    if (seg.isBold) textStyle.push(activeStyles.bold);
    if (seg.isItalic) textStyle.push(activeStyles.italic);
    if (seg.isStrikethrough) textStyle.push(activeStyles.strikethrough);
    if (seg.isCode) textStyle.push(activeStyles.code);
    if (seg.isLink) textStyle.push(activeStyles.link);
    if (seg.isBlockquote) textStyle.push(activeStyles.blockquote);
    if (seg.isBullet) textStyle.push(activeStyles.bullet);
    if (seg.isCodeBlock) textStyle.push(activeStyles.codeblock);

    // Apply Headers
    if (seg.isHeader && seg.headerLevel) {
      const headerKey = `header${seg.headerLevel}` as keyof typeof activeStyles;
      if (activeStyles[headerKey]) {
        textStyle.push(activeStyles[headerKey] as TextStyle);
      }
    }

    // Apply Markdown Syntax Character Styles (make symbols transparent/faded)
    if (seg.isSyntax) {
      textStyle.push(activeStyles.syntax);
    }

    // Apply user-provided Markdown styling overrides
    if (markdownStyles) {
      if (seg.isBold && markdownStyles.bold) textStyle.push(markdownStyles.bold);
      if (seg.isItalic && markdownStyles.italic) textStyle.push(markdownStyles.italic);
      if (seg.isStrikethrough && markdownStyles.strikethrough) textStyle.push(markdownStyles.strikethrough);
      if (seg.isCode && markdownStyles.code) textStyle.push(markdownStyles.code);
      if (seg.isLink && markdownStyles.link) textStyle.push(markdownStyles.link);
      if (seg.isBlockquote && markdownStyles.blockquote) textStyle.push(markdownStyles.blockquote);
      if (seg.isBullet && markdownStyles.bullet) textStyle.push(markdownStyles.bullet);
      if (seg.isCodeBlock && markdownStyles.codeblock) textStyle.push(markdownStyles.codeblock);
      if (seg.isSyntax && markdownStyles.syntax) textStyle.push(markdownStyles.syntax);

      if (seg.isHeader && seg.headerLevel) {
        const headerOverrideKey = `header${seg.headerLevel}` as keyof MarkdownStyles;
        if (markdownStyles[headerOverrideKey]) {
          textStyle.push(markdownStyles[headerOverrideKey] as TextStyle);
        }
      }
    }

    return (
      <Text key={`${index}-${seg.text}`} style={textStyle}>
        {seg.text}
      </Text>
    );
  };

  return (
    <TextInput
      ref={inputRef}
      multiline={multiline}
      value={value}
      onChangeText={onChangeText}
      style={[
        theme === 'dark' ? styles.inputDark : styles.inputLight,
        activeStyles.baseText,
        style,
      ]}
      {...props}
    >
      {segments.map((seg, idx) => renderSegment(seg, idx))}
    </TextInput>
  );
};

export const MarkdownInput = forwardRef(MarkdownInputComponent);

const fontFamilyMonospace = Platform.select({
  ios: 'Courier New',
  android: 'monospace',
  default: 'monospace',
});

// Premium Dark Theme styling
const darkThemeStyles = StyleSheet.create({
  baseText: {
    color: '#E2E8F0',
    fontSize: 16,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  italic: {
    fontStyle: 'italic',
    color: '#CBD5E1',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  code: {
    fontFamily: fontFamilyMonospace,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#F87171',
    fontSize: 14,
    fontWeight: '500',
  },
  link: {
    color: '#38BDF8',
    textDecorationLine: 'underline',
  },
  blockquote: {
    fontStyle: 'italic',
    color: '#94A3B8',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bullet: {
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  codeblock: {
    fontFamily: fontFamilyMonospace,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#34D399',
    fontSize: 14,
  },
  syntax: {
    color: 'rgba(255, 255, 255, 0.28)',
    fontWeight: 'normal',
  },
  header1: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  header2: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F1F5F9',
    lineHeight: 28,
  },
  header3: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#E2E8F0',
    lineHeight: 25,
  },
  header4: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#CBD5E1',
    lineHeight: 23,
  },
  header5: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94A3B8',
    lineHeight: 22,
  },
  header6: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#64748B',
    lineHeight: 21,
  },
});

// Premium Light Theme styling
const lightThemeStyles = StyleSheet.create({
  baseText: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  italic: {
    fontStyle: 'italic',
    color: '#475569',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  code: {
    fontFamily: fontFamilyMonospace,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  link: {
    color: '#0284C7',
    textDecorationLine: 'underline',
  },
  blockquote: {
    fontStyle: 'italic',
    color: '#64748B',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  bullet: {
    fontWeight: 'bold',
    color: '#0284C7',
  },
  codeblock: {
    fontFamily: fontFamilyMonospace,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    color: '#059669',
    fontSize: 14,
  },
  syntax: {
    color: 'rgba(0, 0, 0, 0.22)',
    fontWeight: 'normal',
  },
  header1: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 32,
  },
  header2: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    lineHeight: 28,
  },
  header3: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#334155',
    lineHeight: 25,
  },
  header4: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#475569',
    lineHeight: 23,
  },
  header5: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
    lineHeight: 22,
  },
  header6: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#94A3B8',
    lineHeight: 21,
  },
});

const styles = StyleSheet.create({
  inputDark: {
    padding: 12,
    textAlignVertical: 'top',
  },
  inputLight: {
    padding: 12,
    textAlignVertical: 'top',
  },
});
