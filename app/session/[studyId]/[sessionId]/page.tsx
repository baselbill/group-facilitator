"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStudy, getSession } from "@/lib/content";
import {
  writeState,
  firstPendingIndex,
  markSessionDone,
} from "@/lib/sessionState";
import { generateRoomCode, useRoom } from "@/lib/room";
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
  const searchParams = useSearchParams();

  const { study, error } = getStudy();
  const session = study ? getSession(study, sessionId) : null;

  const [phase, setPhase] = useState<Phase>("preamble");
  const [questionIndex, setQuestionIndex] = useState(0);

  // Room state
  const participantRole = searchParams.get("role"); // "participant" or null (host)
  const urlRoomCode = searchParams.get("room");
  const [roomCode, setRoomCode] = useState<string | null>(urlRoomCode);

  const handleAdvance = useCallback((idx: number) => {
    setQuestionIndex(idx);
    setPhase("session");
  }, []);

  const { connectionState, highlights, userId, sendHighlight, sendAdvance } =
    useRoom(roomCode, handleAdvance);

  // On mount: check if there's an in-progress session to restore
  useEffect(() => {
    if (!session) return;
    // Participants skip preamble and go straight to session
    if (participantRole === "participant") {
      setPhase("session");
      return;
    }
    const ids = session.questions.map((q) => q.id);
    const pending = firstPendingIndex(studyId, sessionId, ids);
    if (pending > 0) {
      setQuestionIndex(pending === -1 ? ids.length - 1 : pending);
      setPhase("session");
    }
  }, [studyId, sessionId, session, participantRole]);

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

  function startRoom() {
    const code = generateRoomCode();
    setRoomCode(code);
    const params = new URLSearchParams(searchParams.toString());
    params.set("room", code);
    router.replace(`?${params.toString()}`);
  }

  function previous() {
    if (questionIndex === 0) return;
    const prevIndex = questionIndex - 1;
    setQuestionIndex(prevIndex);
    sendAdvance(prevIndex);
  }

  function advance(state: "covered" | "skipped") {
    writeState(studyId, sessionId, currentQuestion.id, state);
    const nextIndex = isLast ? questionIndex : questionIndex + 1;
    if (isLast) {
      markSessionDone(studyId, sessionId);
      setPhase("done");
    } else {
      setQuestionIndex(nextIndex);
      sendAdvance(nextIndex);
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
          onStartRoom={startRoom}
          roomCode={roomCode}
          onBack={() => router.push("/")}
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
        onPrevious={previous}
        onExit={() => router.push("/")}
        roomCode={roomCode ?? undefined}
        studyId={studyId}
        sessionId={sessionId}
        userId={userId}
        highlights={highlights}
        connectionState={connectionState}
        onHighlight={sendHighlight}
      />
    </main>
  );
}
