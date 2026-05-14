import { z } from "zod";

const SituationTagSchema = z.enum([
  "opens discussion",
  "for the quiet member",
  "if someone is dominating",
  "if conversation goes off-track",
  "to close a long response",
]);

const PromptSchema = z.object({
  id: z.string(),
  situation_tag: SituationTagSchema,
  prompt_text: z.string(),
});

const QuestionSchema = z.object({
  id: z.string(),
  question_number: z.number(),
  question_text: z.string(),
  answer_text: z.string(),
  scripture_refs: z.array(z.string()),
  prompts: z.array(PromptSchema),
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
