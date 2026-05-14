"use client";

import { useEffect, useState } from "react";
import { fetchVerse, VerseResult } from "@/lib/bibleApi";

interface Props {
  verseRef: string;
  onClose: () => void;
}

type State =
  | { status: "loading" }
  | { status: "ok"; result: VerseResult }
  | { status: "error" };

export default function VerseModal({ verseRef, onClose }: Props) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchVerse(verseRef)
      .then((result) => {
        if (!cancelled) setState({ status: "ok", result });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [verseRef]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2 className="modal-title">{verseRef}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="modal-body">
          {state.status === "loading" && (
            <p className="modal-loading">Loading…</p>
          )}
          {state.status === "error" && (
            <p className="modal-error">
              Could not load verse. Check your connection.
            </p>
          )}
          {state.status === "ok" && (
            <>
              <p className="modal-ref">{state.result.reference}</p>
              <p className="modal-verse-text">{state.result.text}</p>
              <p className="modal-translation">{state.result.translation}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
