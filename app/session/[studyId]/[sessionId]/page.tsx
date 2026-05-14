"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStudy, getSession } from "@/lib/content";
import {
  writeState,
  firstPendingIndex,
  markSessionDone,
} from "@/lib/sessionState";
import SessionPreamble from "@/components/SessionPreamble";
import SessionCard from "@/components/SessionCard";
import CompletionScreen from "@/components/CompletionScreen";

type Phase = "preamble" | "session" | "done";

interface Props {
  params: Promise<{ studyId: string; sessionId: string }>;
}

export default function SessionPage({ params }: Props) {
  const { studyId, sessionId } = use(params);
  const router = useRouter();

  const { study, error } = getStudy();
  const session = study ? getSession(study, sessionId) : null;

  const [phase, setPhase] = useState<Phase>("preamble");
  const [questionIndex, setQuestionIndex] = useState(0);

  // On mount: check if there's an in-progress session to restore
  useEffect(() => {
    if (!session) return;
    const ids = session.questions.map((q) => q.id);
    const pending = firstPendingIndex(studyId, sessionId, ids);
    if (pending > 0) {
      // Has in-progress state — skip preamble and restore position
      setQuestionIndex(pending === -1 ? ids.length - 1 : pending);
      setPhase("session");
    }
  }, [studyId, sessionId, session]);

  if (error || !study) {
    return (
      <main className="error-screen">
        <p className="error-message">
          Content unavailable — check your connection or reload.
        </p>
        <button className="btn-primary" onClick={() => router.push("/")}>
          Back
        </button>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="error-screen">
        <p className="error-message">Session not found.</p>
        <button className="btn-primary" onClick={() => router.push("/")}>
          Back
        </button>
      </main>
    );
  }

  const questions = session.questions;
  const currentQuestion = questions[questionIndex];
  const isLast = questionIndex === questions.length - 1;

  function handleStart() {
    setPhase("session");
  }

  function advance(state: "covered" | "skipped") {
    writeState(studyId, sessionId, currentQuestion.id, state);
    if (isLast) {
      markSessionDone(studyId, sessionId);
      setPhase("done");
    } else {
      setQuestionIndex((i) => i + 1);
    }
  }

  if (phase === "preamble") {
    return (
      <main className="page-root">
        <SessionPreamble
          title={session.title}
          theme={session.theme}
          questionCount={questions.length}
          onStart={handleStart}
        />
      </main>
    );
  }

  if (phase === "done") {
    return (
      <main className="page-root">
        <CompletionScreen studyId={studyId} />
      </main>
    );
  }

  return (
    <main className="page-root">
      <SessionCard
        question={currentQuestion}
        questionIndex={questionIndex}
        totalQuestions={questions.length}
        isLast={isLast}
        onNext={() => advance("covered")}
        onSkip={() => advance("skipped")}
      />
    </main>
  );
}
