"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { ConnectionState } from "@/lib/types";

interface Props {
  roomCode: string;
  studyId: string;
  sessionId: string;
  connectionState: ConnectionState;
  participantCount?: number;
}

export default function RoomOverlay({
  roomCode,
  studyId,
  sessionId,
  connectionState,
  participantCount,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join?room=${roomCode}&study=${studyId}&session=${sessionId}`
      : "";

  useEffect(() => {
    if (!showModal || !canvasRef.current || !joinUrl) return;
    QRCode.toCanvas(canvasRef.current, joinUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#3B2A1A", light: "#FAF7F2" },
    });
  }, [showModal, joinUrl]);

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
        {participantCount !== undefined && (
          <span className="room-badge__count">{participantCount}</span>
        )}
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
            <canvas ref={canvasRef} className="room-modal__qr" />
            <p className="room-modal__code">{roomCode}</p>
            <p className="room-modal__url">{joinUrl}</p>
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
