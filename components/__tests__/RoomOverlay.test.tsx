// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import RoomOverlay from "../RoomOverlay";

vi.mock("qrcode", () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined),
  },
}));

const defaultProps = {
  roomCode: "TEST",
  studyId: "hc",
  sessionId: "session-1",
  connectionState: "open" as const,
};

function openModal() {
  fireEvent.click(screen.getByRole("button", { name: /Room TEST/i }));
}

beforeEach(() => {
  Object.defineProperty(window, "location", {
    value: { origin: "https://example.com" },
    writable: true,
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("RoomOverlay — copy button", () => {
  it("shows 'Copied!' when clipboard succeeds", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
    });

    render(<RoomOverlay {...defaultProps} />);
    openModal();
    fireEvent.click(screen.getByText("Copy link"));

    await waitFor(() => expect(screen.getByText("Copied!")).toBeTruthy());
  });

  it("shows 'Could not copy' when clipboard is blocked", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("NotAllowedError")),
      },
      writable: true,
    });

    render(<RoomOverlay {...defaultProps} />);
    openModal();
    fireEvent.click(screen.getByText("Copy link"));

    await waitFor(() => expect(screen.getByText("Could not copy")).toBeTruthy());
  });
});
