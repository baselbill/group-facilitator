"use client";

import { Prompt } from "@/lib/types";

interface Props {
  prompt: Prompt;
  used: boolean;
  onTap: () => void;
}

export default function PromptChip({ prompt, used, onTap }: Props) {
  return (
    <button
      className={`prompt-chip${used ? " prompt-chip--used" : ""}`}
      onClick={onTap}
      aria-pressed={used}
    >
      <span className="prompt-tag">{prompt.situation_tag}</span>
      <span className="prompt-text">{prompt.prompt_text}</span>
    </button>
  );
}
