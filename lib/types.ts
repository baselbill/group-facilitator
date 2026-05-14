export type QuestionState = "pending" | "covered" | "skipped";

export interface DiscussionQuestion {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  question_number: number;
  question_text: string;
  answer_text: string;
  scripture_refs: string[];
  discussion_questions: DiscussionQuestion[];
}

export interface Session {
  id: string;
  title: string;
  week_number: number;
  session_number: number;
  theme: string;
  questions: Question[];
}

export interface Study {
  id: string;
  title: string;
  tradition: string;
  description: string;
  session_unit_label: string;
  sessions: Session[];
}

// Room / highlighting types
export interface RoomState {
  roomCode: string;
  isHost: boolean;
}

// questionId -> wordIndex -> Set of userIds
export type HighlightMap = Map<string, Map<number, Set<string>>>;

export type ConnectionState = "connecting" | "open" | "offline";

export interface StoredQuestionState {
  state: QuestionState;
  timestamp: number;
}

export type SessionStateMap = Record<string, StoredQuestionState>;
