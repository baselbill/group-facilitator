"use client";

import { useRouter } from "next/navigation";
import { ValidatedStudy } from "@/lib/schema";
import { isSessionDone } from "@/lib/sessionState";

interface Props {
  study: ValidatedStudy;
}

export default function LordsDayPicker({ study }: Props) {
  const router = useRouter();

  // Current week: week_number matching today's ISO week (simple approach: use session index)
  // For now, default to the first session not yet done, or session 1.
  const currentWeek = getCurrentWeek();

  function getCurrentWeek(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.ceil(diff / oneWeek);
  }

  function handleSelect(sessionId: string) {
    router.push(`/session/${study.id}/${sessionId}`);
  }

  return (
    <div className="picker-container">
      <header className="picker-header">
        <h1 className="picker-title">{study.title}</h1>
        <p className="picker-subtitle">{study.session_unit_label} by {study.session_unit_label}</p>
      </header>

      <ul className="picker-list" role="list">
        {study.sessions.map((session) => {
          const isThisWeek = session.week_number === currentWeek;
          const isDone = isSessionDone(study.id, session.id);
          const qCount = session.questions.length;

          return (
            <li key={session.id} className="picker-item">
              <button
                className={`picker-row${isThisWeek ? " picker-row--current" : ""}${isDone ? " picker-row--done" : ""}`}
                onClick={() => handleSelect(session.id)}
              >
                <div className="picker-row-main">
                  <div className="picker-row-title">
                    {session.title}
                    {isThisWeek && (
                      <span className="picker-badge">This week</span>
                    )}
                  </div>
                  <div className="picker-row-sub">
                    {session.theme} · {qCount} question{qCount !== 1 ? "s" : ""}
                  </div>
                </div>
                {isDone && <span className="picker-done-mark" aria-label="Completed">✓</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
