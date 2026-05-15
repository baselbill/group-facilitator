export interface Token {
  text: string;
  isWord: boolean;
  index: number; // word position (0-based); -1 for non-word tokens
}

export function tokenize(text: string): Token[] {
  // Split on whitespace, keeping each run of whitespace as a separator token
  const parts = text.split(/(\s+)/);
  const tokens: Token[] = [];
  let wordIndex = 0;

  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      tokens.push({ text: part, isWord: false, index: -1 });
    } else if (part.length > 0) {
      tokens.push({ text: part, isWord: true, index: wordIndex++ });
    }
  }

  return tokens;
}
