import { z } from "zod";

const literalUnion = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union(values.map((value) => z.literal(value)) as { [K in keyof T]: z.ZodLiteral<T[K]> });

const FALLBACK_VALUES = {
  name: ["No name provided.", "Not provided"] as const,
  email: ["No email provided.", "Not provided"] as const,
  phone: ["No phone number provided.", "Not provided"] as const,
  education: ["No education information found."] as const,
  skills: ["No skills provided."] as const,
  projectTitle: ["Information not available"] as const,
  projectSummary: ["No project information provided."] as const,
  summary: ["No experience summary provided.", "This document does not appear to be a valid resume."] as const,
} as const;

const projectSchema = z.object({
  title: z
    .string()
    .min(1, "Project title is required")
    .or(literalUnion(FALLBACK_VALUES.projectTitle)),
  summary: z
    .string()
    .min(10, "Project summary should describe the work")
    .or(literalUnion(FALLBACK_VALUES.projectSummary)),
});

export const resumeSchema = z.object({
  name: z.string().min(1, "Name is required").or(literalUnion(FALLBACK_VALUES.name)),
  email: z
    .string()
    .email("Must be a valid email address")
    .or(literalUnion(FALLBACK_VALUES.email)),
  phone: z
    .string()
    .min(5, "Phone number is required")
    .or(literalUnion(FALLBACK_VALUES.phone)),
  education: z
    .array(z.string().min(1).or(literalUnion(FALLBACK_VALUES.education)))
    .nonempty("Include at least one education entry"),
  skills: z
    .array(z.string().min(1).or(literalUnion(FALLBACK_VALUES.skills)))
    .nonempty("Include at least one skill"),
  projects: z.array(projectSchema).nonempty("Include at least one project entry"),
  experience_summary: z
    .string()
    .min(10, "Experience summary should be descriptive")
    .or(literalUnion(FALLBACK_VALUES.summary)),
});

export type ResumePayload = z.infer<typeof resumeSchema>;

export function assertResumePayload(data: unknown): ResumePayload {
  const parsed = resumeSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(message);
  }
  return parsed.data;
}
