export type SituationTag =
  | "opens discussion"
  | "for the quiet member"
  | "if someone is dominating"
  | "if conversation goes off-track"
  | "to close a long response";

export type QuestionState = "pending" | "covered" | "skipped";

export interface Prompt {
  id: string;
  situation_tag: SituationTag;
  prompt_text: string;
}

export interface Question {
  id: string;
  question_number: number;
  question_text: string;
  answer_text: string;
  scripture_refs: string[];
  prompts: Prompt[];
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

export interface StoredQuestionState {
  state: QuestionState;
  timestamp: number;
}

export type SessionStateMap = Record<string, StoredQuestionState>;
