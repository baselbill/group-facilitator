"use client";

import { useState } from "react";
import { Question } from "@/lib/types";
import type { HighlightMap, ConnectionState } from "@/lib/types";
import PromptChip from "./PromptChip";
import VerseModal from "./VerseModal";
import HighlightableText from "./HighlightableText";
import RoomOverlay from "./RoomOverlay";

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  isLast: boolean;
  onNext: () => void;
  onSkip: () => void;
  onPrevious?: () => void;
  onExit?: () => void;
  // Room props — all optional; omit for local-only mode
  roomCode?: string;
  studyId?: string;
  sessionId?: string;
  userId?: string;
  highlights?: HighlightMap;
  connectionState?: ConnectionState;
  onHighlight?: (questionId: string, wordIndex: number, active: boolean) => void;
}

export default function SessionCard({
  question,
  questionIndex,
  totalQuestions,
  isLast,
  onNext,
  onSkip,
  onPrevious,
  onExit,
  roomCode,
  studyId,
  sessionId,
  userId = "",
  highlights,
  connectionState,
  onHighlight,
}: Props) {
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);

  // Reset when question changes
  const [lastQuestionId, setLastQuestionId] = useState(question.id);
  if (question.id !== lastQuestionId) {
    setLastQuestionId(question.id);
    setUsedQuestions(new Set());
  }

  function toggleQuestion(questionId: string) {
    setUsedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  const allDiscussed =
    question.discussion_questions.length > 0 &&
    question.discussion_questions.every((q) => usedQuestions.has(q.id));

  const inRoom = !!roomCode;
  const wordHighlightsForQuestion = highlights?.get(question.id);

  function handleWordTap(wordIndex: number, active: boolean) {
    onHighlight?.(question.id, wordIndex, active);
  }

  return (
    <div className="card-screen">
      {/* Header */}
      <header className="card-header">
        {onExit ? (
          <button className="nav-back" onClick={onExit} aria-label="Back to sessions">
            ← Sessions
          </button>
        ) : (
          <span className="card-study-name">Heidelberg Catechism</span>
        )}
        <span className="card-session-label">
          Q{questionIndex + 1} · {totalQuestions} this week
        </span>
      </header>

      {/* Scrollable content */}
      <div className="card-body">
        {inRoom ? (
          <>
            <p className="card-question">
              <HighlightableText
                text={question.question_text}
                userId={userId}
                wordHighlights={highlights?.get(question.id + "-q")}
                onTap={(wi, active) => onHighlight?.(question.id + "-q", wi, active)}
              />
            </p>
            <p className="card-answer">
              <HighlightableText
                text={question.answer_text}
                userId={userId}
                wordHighlights={highlights?.get(question.id + "-a")}
                onTap={(wi, active) => onHighlight?.(question.id + "-a", wi, active)}
              />
            </p>
          </>
        ) : (
          <>
            <p className="card-question">{question.question_text}</p>
            <p className="card-answer">{question.answer_text}</p>
          </>
        )}

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

        <p className="prompts-label">Discussion questions</p>

        <div
          className={`prompts-list${allDiscussed ? " prompts-list--all-used" : ""}`}
        >
          {question.discussion_questions.map((dq, idx) => (
            <PromptChip
              key={dq.id}
              question={dq}
              index={idx}
              used={usedQuestions.has(dq.id)}
              onTap={() => toggleQuestion(dq.id)}
            />
          ))}
          {allDiscussed && (
            <p className="prompts-all-used">All questions discussed</p>
          )}
        </div>

        {inRoom && (
          <p className="room-hint">
            {connectionState === "offline"
              ? "Offline — highlights won’t sync until you reconnect."
              : "Tap any word to highlight it for the group."}
          </p>
        )}
      </div>

      {selectedVerse && (
        <VerseModal
          verseRef={selectedVerse}
          onClose={() => setSelectedVerse(null)}
        />
      )}

      {/* Room badge */}
      {inRoom && roomCode && studyId && sessionId && connectionState && (
        <RoomOverlay
          roomCode={roomCode}
          studyId={studyId}
          sessionId={sessionId}
          connectionState={connectionState}
        />
      )}

      {/* Bottom bar */}
      <div className="card-footer">
        {onPrevious && questionIndex > 0 && (
          <button className="btn-prev" onClick={onPrevious}>
            ← Back
          </button>
        )}
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
