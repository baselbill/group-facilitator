"use client";

import { useRouter } from "next/navigation";

interface Props {
  studyId: string;
}

export default function CompletionScreen({ studyId: _studyId }: Props) {
  const router = useRouter();

  return (
    <div className="completion-screen">
      <div className="completion-body">
        <p className="completion-mark">✓</p>
        <h1 className="completion-title">Good session.</h1>
        <p className="completion-sub">See you next week.</p>
      </div>
      <div className="completion-footer">
        <button
          className="btn-primary"
          onClick={() => router.push("/")}
        >
          Done
        </button>
      </div>
    </div>
  );
}
