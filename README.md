# react-native-markdown-input 📝✨

A high-performance, real-time Markdown-highlighted TextInput component for React Native and Expo. Built completely in TypeScript with zero heavy dependencies or WebViews.

Unlike other editors that rely on heavy, slow WebViews or suffer from typing lag and cursor jumping, `react-native-markdown-input` uses native platforms' rich text layout engines (CoreText / Layout) to provide smooth, high-fidelity real-time syntax styling in standard multiline input fields.

<p align="center">
  <img src="https://raw.githubusercontent.com/username/react-native-markdown-input/main/assets/demo.gif" width="360" alt="react-native-markdown-input Demo" />
</p>

---

## 🚀 Key Features

* **⚡ Zero WebView Overhead**: Highly-optimized tokenizing parser translates characters to nested native `Text` elements with zero scrolling lag.
* **📱 Dual Compatibility**: Runs out of the box in **Expo Go** (no custom dev clients required) and **Bare React Native** projects.
* **🔮 Perfect Cursor Physics**: Non-destructive tokenizer preserves every single character verbatim, preventing cursor jumps or word-wrap glitches.
* **🎨 Low-Opacity Markdown Markers**: Automatically fades Markdown formatting symbols (like `**`, `*`, `[]`) to keep the editor clean yet easily editable.
* **🌙 Dark & Light Themes**: Sleek presets out of the box, with full control to override individual markdown element styles.
* **💪 Strict TypeScript**: Fully typed definitions export for seamless IDE autocompletions.

---

## 📦 Installation

Install the library in your React Native project:

```bash
npm install react-native-markdown-input
# or
yarn add react-native-markdown-input
```

---

## 💻 Usage

Simply replace your standard `TextInput` with `<MarkdownInput />`.

```tsx
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { MarkdownInput } from 'react-native-markdown-input';

export default function App() {
  const [text, setText] = useState(
    "# Markdown Editor\n\n" +
    "This is **bold** text and this is *italic* text.\n\n" +
    "Check out inline `const code = true;` or links like [GitHub](https://github.com).\n\n" +
    "> A blockquote that spans multiple characters."
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <MarkdownInput
          value={text}
          onChangeText={setText}
          theme="dark" // 'dark' | 'light'
          placeholder="Start writing markdown..."
          style={styles.editor}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  card: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  editor: {
    flex: 1,
    padding: 16,
    color: '#E2E8F0',
  },
});
```

---

## 🎨 Customizing Styles & Themes

You can customize elements by providing the `markdownStyles` property:

```tsx
<MarkdownInput
  value={text}
  onChangeText={setText}
  theme="light"
  markdownStyles={{
    bold: {
      fontWeight: '900',
      color: '#4F46E5', // Slate Indigo
    },
    syntax: {
      color: 'rgba(79, 70, 229, 0.3)', // Indigo marker highlights
    },
    code: {
      backgroundColor: '#FEF3C7',
      color: '#D97706',
      fontFamily: 'Courier',
    },
  }}
/>
```

---

## 📖 Component API

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | **Required** | The raw markdown text value of the editor. |
| `onChangeText` | `(text: string) => void` | **Required** | Callback invoked when the raw text changes. |
| `theme` | `'dark' \| 'light'` | `'dark'` | Standard dark or light editor themes. |
| `markdownStyles` | `MarkdownStyles` | `undefined` | Custom text styling parameters to override individual tags. |
| `onMarkdownParse` | `(segments: TextSegment[]) => void` | `undefined` | Optional callback triggered when markdown parses (for word/char counts or custom preview rendering). |
| *Standard Props* | `TextInputProps` | `-` | Inherits all properties from React Native's `<TextInput>` (e.g. `placeholder`, `keyboardType`, `ref`, etc). |

---

## 🛠️ Markdown Element Overrides

You can supply individual styles for the following Markdown selectors:

* `bold` (`**text**`, `__text__`)
* `italic` (`*text*`, `_text_`)
* `strikethrough` (`~~text~~`)
* `code` (\`inline code\`)
* `link` (`[label](url)`)
* `blockquote` (`> text`)
* `bullet` (`- item`, `* item`, `• item`)
* `codeblock` (\`\`\` block \`\`\`)
* `syntax` (Markdown formatting tokens)
* `header1` (`# `) to `header6` (`###### `)

---

## 🛡️ License

This project is licensed under the MIT License.
