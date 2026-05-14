"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import type { ConnectionState, HighlightMap } from "./types";
import type { HighlightMsg, AdvanceMsg, RoomMsg } from "../party/server";

const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "group-facilitator.billyzhou.partykit.dev";

function getUserId(): string {
  if (typeof sessionStorage === "undefined") return "anon";
  let id = sessionStorage.getItem("gf_uid");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("gf_uid", id);
  }
  return id;
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function useRoom(roomCode: string | null, onAdvance?: (idx: number) => void) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("offline");
  const [highlights, setHighlights] = useState<HighlightMap>(new Map());
  const socketRef = useRef<PartySocket | null>(null);
  const userId = useRef(getUserId());

  useEffect(() => {
    if (!roomCode) return;

    setConnectionState("connecting");
    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomCode,
    });
    socketRef.current = socket;

    socket.addEventListener("open", () => setConnectionState("open"));
    socket.addEventListener("close", () => setConnectionState("offline"));
    socket.addEventListener("error", () => setConnectionState("offline"));

    socket.addEventListener("message", (evt) => {
      const msg = JSON.parse(evt.data as string) as RoomMsg;

      if (msg.type === "sync") {
        onAdvance?.(msg.questionIndex);
        setHighlights(deserializeHighlights(msg.highlights));
      }

      if (msg.type === "advance") {
        onAdvance?.(msg.questionIndex);
      }

      if (msg.type === "highlight") {
        setHighlights((prev) => applyHighlight(prev, msg));
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
      setConnectionState("offline");
    };
  }, [roomCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendHighlight = useCallback(
    (questionId: string, wordIndex: number, active: boolean) => {
      const msg: HighlightMsg = {
        type: "highlight",
        userId: userId.current,
        questionId,
        wordIndex,
        active,
      };
      socketRef.current?.send(JSON.stringify(msg));
    },
    []
  );

  const sendAdvance = useCallback((questionIndex: number) => {
    const msg: AdvanceMsg = { type: "advance", questionIndex };
    socketRef.current?.send(JSON.stringify(msg));
  }, []);

  return {
    connectionState,
    highlights,
    userId: userId.current,
    sendHighlight,
    sendAdvance,
  };
}

function applyHighlight(prev: HighlightMap, msg: HighlightMsg): HighlightMap {
  const next = new Map(prev);
  if (!next.has(msg.questionId)) next.set(msg.questionId, new Map());
  const wordMap = new Map(next.get(msg.questionId)!);
  const users = new Set(wordMap.get(msg.wordIndex) ?? []);
  if (msg.active) users.add(msg.userId);
  else users.delete(msg.userId);
  wordMap.set(msg.wordIndex, users);
  next.set(msg.questionId, wordMap);
  return next;
}

function deserializeHighlights(
  raw: Record<string, Record<number, string[]>>
): HighlightMap {
  const map: HighlightMap = new Map();
  for (const [qId, words] of Object.entries(raw)) {
    const wordMap = new Map<number, Set<string>>();
    for (const [widxStr, users] of Object.entries(words)) {
      wordMap.set(Number(widxStr), new Set(users));
    }
    map.set(qId, wordMap);
  }
  return map;
}
