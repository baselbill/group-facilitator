import type * as Party from "partykit/server";

export interface HighlightMsg {
  type: "highlight";
  userId: string;
  questionId: string;
  wordIndex: number;
  active: boolean;
}

export interface AdvanceMsg {
  type: "advance";
  questionIndex: number;
}

export interface SyncMsg {
  type: "sync";
  questionIndex: number;
  highlights: HighlightState;
}

// questionId -> wordIndex -> userId[]
type HighlightState = Record<string, Record<number, string[]>>;

export type RoomMsg = HighlightMsg | AdvanceMsg | SyncMsg;

export default class RoomServer implements Party.Server {
  questionIndex = 0;
  highlights: HighlightState = {};

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    conn.send(
      JSON.stringify({
        type: "sync",
        questionIndex: this.questionIndex,
        highlights: this.highlights,
      } satisfies SyncMsg)
    );
  }

  onMessage(message: string, sender: Party.Connection) {
    const msg = JSON.parse(message) as RoomMsg;

    if (msg.type === "advance") {
      this.questionIndex = msg.questionIndex;
      // Clear highlights for questions behind current position
      this.room.broadcast(message);
    }

    if (msg.type === "highlight") {
      const { userId, questionId, wordIndex, active } = msg;
      if (!this.highlights[questionId]) this.highlights[questionId] = {};
      const word = this.highlights[questionId][wordIndex] ?? [];
      if (active) {
        if (!word.includes(userId)) word.push(userId);
      } else {
        const idx = word.indexOf(userId);
        if (idx !== -1) word.splice(idx, 1);
      }
      this.highlights[questionId][wordIndex] = word;
      // Broadcast to everyone including sender (for multi-tab)
      this.room.broadcast(message, []);
    }
  }
}

RoomServer satisfies Party.Worker;
