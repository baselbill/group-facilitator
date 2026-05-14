"use client";

interface Props {
  verseRef: string;
  onClose: () => void;
}

export default function VerseModal({ verseRef, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2 className="modal-title">{verseRef}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="modal-body">
          <p className="modal-text">
            Open in your preferred Bible app to read this verse.
          </p>
          <div className="modal-links">
            <a
              href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(verseRef)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-link-btn"
            >
              Bible Gateway
            </a>
            <a
              href={`https://www.bible.com/search/all?q=${encodeURIComponent(verseRef)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-link-btn"
            >
              YouVersion Bible
            </a>
            <a
              href={`https://biblehub.com/${verseRef.replace(/\./g, "").replace(/ /g, "-").toLowerCase()}.htm`}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-link-btn"
            >
              Bible Hub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
