"use client";

import { DiscussionQuestion } from "@/lib/types";

interface Props {
  question: DiscussionQuestion;
  index: number;
  used: boolean;
  onTap: () => void;
}

export default function PromptChip({ question, index, used, onTap }: Props) {
  return (
    <button
      className={`prompt-chip${used ? " prompt-chip--used" : ""}`}
      onClick={onTap}
      aria-pressed={used}
    >
      <span className="prompt-tag">{index + 1}</span>
      <span className="prompt-text">{question.text}</span>
    </button>
  );
}
