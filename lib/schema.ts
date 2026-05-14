import { z } from "zod";

const DiscussionQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const QuestionSchema = z.object({
  id: z.string(),
  question_number: z.number(),
  question_text: z.string(),
  answer_text: z.string(),
  scripture_refs: z.array(z.string()),
  discussion_questions: z.array(DiscussionQuestionSchema),
});

const SessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  week_number: z.number(),
  session_number: z.number(),
  theme: z.string(),
  questions: z.array(QuestionSchema),
});

export const StudySchema = z.object({
  id: z.string(),
  title: z.string(),
  tradition: z.string(),
  description: z.string(),
  session_unit_label: z.string(),
  sessions: z.array(SessionSchema),
});

export type ValidatedStudy = z.infer<typeof StudySchema>;
