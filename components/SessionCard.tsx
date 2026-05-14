"use client";

import { useEffect, useRef, useState } from "react";
import { Question } from "@/lib/types";
import PromptChip from "./PromptChip";
import VerseModal from "./VerseModal";

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  isLast: boolean;
  sessionLengthMin: number;
  onNext: () => void;
  onSkip: () => void;
  onSessionStart: () => void;
  sessionStarted: boolean;
}

type TimerPhase = "green" | "amber" | "red";

export default function SessionCard({
  question,
  questionIndex,
  totalQuestions,
  isLast,
  sessionLengthMin,
  onNext,
  onSkip,
  onSessionStart,
  sessionStarted,
}: Props) {
  const [usedPrompts, setUsedPrompts] = useState<Set<string>>(new Set());
  const [timerPhase, setTimerPhase] = useState<TimerPhase>("green");
  const [timerProgress, setTimerProgress] = useState(0); // 0–1
  const [elapsedMs, setElapsedMs] = useState(0);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const perQuestionMs = (sessionLengthMin / totalQuestions) * 60 * 1000;

  // Reset when question changes
  useEffect(() => {
    setUsedPrompts(new Set());
    setTimerPhase("green");
    setTimerProgress(0);
    setElapsedMs(0);
    startTimeRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [question.id]);

  // Start timer when session starts
  useEffect(() => {
    if (!sessionStarted) return;
    if (startTimeRef.current !== null) return;
    startTimeRef.current = Date.now();

    function tick() {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / perQuestionMs, 1);
      setTimerProgress(progress);
      setElapsedMs(elapsed);

      if (progress >= 1) {
        setTimerPhase("red");
      } else if (progress >= 0.67) {
        setTimerPhase("amber");
      } else {
        setTimerPhase("green");
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sessionStarted, perQuestionMs]);

  function togglePrompt(promptId: string) {
    if (!sessionStarted) onSessionStart();
    setUsedPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(promptId)) next.delete(promptId);
      else next.add(promptId);
      return next;
    });
  }

  const allPromptsUsed =
    question.prompts.length > 0 &&
    question.prompts.every((p) => usedPrompts.has(p.id));

  const timerColor =
    timerPhase === "green"
      ? "#5A8A5A"
      : timerPhase === "amber"
      ? "#C4853A"
      : "#B04040";

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="card-screen">
      {/* Header */}
      <header className="card-header">
        <span className="card-study-name">Heidelberg Catechism</span>
        <span className="card-session-label">
          Q{questionIndex + 1} · {totalQuestions} this week
          {sessionStarted && <span className="card-timer">{formatTime(elapsedMs)}</span>}
        </span>
      </header>

      {/* Timer bar */}
      <div className="timer-bar-wrap" aria-hidden="true">
        <div className="timer-bar">
          <div
            className="timer-fill"
            style={{
              width: `${timerProgress * 100}%`,
              backgroundColor: timerColor,
              transition: "background-color 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="card-body">
        <p className="card-question">{question.question_text}</p>
        <p className="card-answer">{question.answer_text}</p>
        {question.scripture_refs.length > 0 && (
          <p className="card-refs">
            {question.scripture_refs.map((ref, idx) => (
              <span key={idx}>
                {idx > 0 && " · "}
                <button
                  className="verse-link"
                  onClick={() => setSelectedVerse(ref)}
                >
                  {ref}
                </button>
              </span>
            ))}
          </p>
        )}

        <hr className="card-divider" />

        <p className="prompts-label">Facilitation prompts</p>

        <div
          className={`prompts-list${allPromptsUsed ? " prompts-list--all-used" : ""}`}
        >
          {question.prompts.map((prompt) => (
            <PromptChip
              key={prompt.id}
              prompt={prompt}
              used={usedPrompts.has(prompt.id)}
              onTap={() => togglePrompt(prompt.id)}
            />
          ))}
          {allPromptsUsed && (
            <p className="prompts-all-used">All prompts used</p>
          )}
        </div>
      </div>

      {selectedVerse && (
        <VerseModal
          verseRef={selectedVerse}
          onClose={() => setSelectedVerse(null)}
        />
      )}

      {/* Timer + bottom bar */}
      <div className="card-footer">
        <div className="bottom-bar">
          <button className="btn-skip" onClick={onSkip}>
            Skip
          </button>
          <button className="btn-primary" onClick={onNext}>
            {isLast ? "Wrap session →" : "Good enough — next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
