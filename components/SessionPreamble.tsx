"use client";

interface Props {
  title: string;
  theme: string;
  questionCount: number;
  sessionLength: number;
  onStart: (sessionLength: number) => void;
}

const SESSION_LENGTHS = [45, 60, 90];

export default function SessionPreamble({
  title,
  theme,
  questionCount,
  sessionLength,
  onStart,
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

        <div className="preamble-length-section">
          <p className="preamble-length-label">Session length</p>
          <div className="preamble-length-options" role="group" aria-label="Session length">
            {SESSION_LENGTHS.map((len) => (
              <button
                key={len}
                className={`preamble-length-btn${sessionLength === len ? " preamble-length-btn--active" : ""}`}
                onClick={() => onStart(len)}
                aria-pressed={sessionLength === len}
              >
                {len} min
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="preamble-footer">
        <button className="btn-primary" onClick={() => onStart(sessionLength)}>
          Start session
        </button>
      </div>
    </div>
  );
}
