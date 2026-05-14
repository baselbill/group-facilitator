"use client";

import { Suspense, use, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  searchParams: Promise<{ room?: string; study?: string; session?: string }>;
}

function JoinForm({
  initialRoom,
  study,
  session,
}: {
  initialRoom: string;
  study: string;
  session: string;
}) {
  const router = useRouter();
  const [code, setCode] = useState(initialRoom.toUpperCase());
  const [error, setError] = useState("");

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 4) {
      setError("Room code must be 4 characters.");
      return;
    }
    if (study && session) {
      router.push(
        `/session/${study}/${session}?room=${trimmed}&role=participant`
      );
    } else {
      setError("Invalid join link — missing study or session.");
    }
  }

  return (
    <form className="join-form" onSubmit={handleJoin}>
      <label className="join-label" htmlFor="room-code">
        Room code
      </label>
      <input
        id="room-code"
        className="join-input"
        value={code}
        onChange={(e) => {
          setCode(e.target.value.toUpperCase());
          setError("");
        }}
        maxLength={4}
        placeholder="ABCD"
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
      />
      {error && <p className="join-error">{error}</p>}
      <button className="btn-primary" type="submit">
        Join session
      </button>
    </form>
  );
}

function JoinPageInner({ searchParams }: Props) {
  const params = use(searchParams);
  const room = params.room ?? "";
  const study = params.study ?? "";
  const session = params.session ?? "";

  return (
    <main className="page-root">
      <div className="join-screen">
        <p className="join-heading">Join a session</p>
        <JoinForm initialRoom={room} study={study} session={session} />
      </div>
    </main>
  );
}

export default function JoinPage(props: Props) {
  return (
    <Suspense>
      <JoinPageInner {...props} />
    </Suspense>
  );
}
