"use client";

import { tokenize } from "@/lib/tokenize";

interface Props {
  text: string;
  userId: string;
  // wordIndex -> Set of userIds who highlighted it
  wordHighlights: Map<number, Set<string>> | undefined;
  onTap: (wordIndex: number, active: boolean) => void;
}

export default function HighlightableText({
  text,
  userId,
  wordHighlights,
  onTap,
}: Props) {
  const tokens = tokenize(text);

  return (
    <span>
      {tokens.map((token, i) => {
        if (!token.isWord) {
          return <span key={i}>{token.text}</span>;
        }

        const users = wordHighlights?.get(token.index) ?? new Set<string>();
        const isMine = users.has(userId);
        const othersCount = isMine ? users.size - 1 : users.size;

        // Heatmap intensity from others' highlights (0..1)
        const intensity = Math.min(othersCount / 3, 1);

        const style: React.CSSProperties = {};
        if (intensity > 0) {
          style.backgroundColor = `rgba(180, 100, 20, ${0.15 + intensity * 0.45})`;
          style.borderRadius = "2px";
        }

        const className = [
          "highlight-word",
          isMine ? "highlight-word--mine" : "",
          intensity > 0 ? "highlight-word--others" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={i}
            className={className}
            style={style}
            onClick={() => onTap(token.index, !isMine)}
            aria-pressed={isMine}
          >
            {token.text}
          </button>
        );
      })}
    </span>
  );
}
