"use client";

interface Props {
  title: string;
  theme: string;
  questionCount: number;
  onStart: () => void;
  onStartRoom?: () => void;
  roomCode?: string | null;
}

export default function SessionPreamble({
  title,
  theme,
  questionCount,
  onStart,
  onStartRoom,
  roomCode,
}: Props) {
  return (
    <div className="preamble-container">
      <div className="preamble-body">
        <p className="preamble-label">Starting session</p>
        <h1 className="preamble-title">{title}</h1>
        <p className="preamble-theme">{theme}</p>
        <p className="preamble-count">
          {questionCount} question{questionCount !== 1 ? "s" : ""} this week
        </p>
      </div>

      <div className="preamble-footer">
        {roomCode ? (
          <p className="preamble-room-code">
            Room <strong>{roomCode}</strong> ready
          </p>
        ) : onStartRoom ? (
          <button className="btn-secondary" onClick={onStartRoom}>
            Start room
          </button>
        ) : null}
        <button className="btn-primary" onClick={onStart}>
          Start session
        </button>
      </div>
    </div>
  );
}
