import { z } from "zod";

export const resumeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email address"),
  education: z.array(z.string().min(1)).nonempty("Include at least one education entry"),
  skills: z.array(z.string().min(1)).nonempty("Include at least one skill"),
  experience_summary: z.string().min(30, "Experience summary should be descriptive"),
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
