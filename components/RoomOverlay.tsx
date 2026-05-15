"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { ConnectionState } from "@/lib/types";

interface Props {
  roomCode: string;
  studyId: string;
  sessionId: string;
  connectionState: ConnectionState;
}

export default function RoomOverlay({
  roomCode,
  studyId,
  sessionId,
  connectionState,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join?room=${roomCode}&study=${studyId}&session=${sessionId}`
      : "";

  useEffect(() => {
    if (!showModal || !canvasRef.current || !joinUrl) return;
    setQrFailed(false);
    QRCode.toCanvas(canvasRef.current, joinUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#3B2A1A", light: "#FAF7F2" },
    }).catch(() => setQrFailed(true));
  }, [showModal, joinUrl]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  }

  const dotColor =
    connectionState === "open"
      ? "#6B8F3E"
      : connectionState === "connecting"
      ? "#C8943A"
      : "#9B7B5A";

  return (
    <>
      <button
        className="room-badge"
        onClick={() => setShowModal(true)}
        aria-label={`Room ${roomCode} — tap for QR code`}
      >
        <span
          className="room-badge__dot"
          style={{ backgroundColor: dotColor }}
        />
        <span className="room-badge__code">{roomCode}</span>
      </button>

      {showModal && (
        <div
          className="room-modal-backdrop"
          onClick={() => setShowModal(false)}
        >
          <div
            className="room-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="room-modal__label">Scan to join</p>
            {!qrFailed && <canvas ref={canvasRef} className="room-modal__qr" />}
            <p className="room-modal__code">{roomCode}</p>
            <p className="room-modal__url">{joinUrl}</p>
            <button className="btn-secondary" onClick={handleCopy}>
              {copied ? "Copied!" : copyFailed ? "Could not copy" : "Copy link"}
            </button>
            <button
              className="btn-primary"
              onClick={() => setShowModal(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
