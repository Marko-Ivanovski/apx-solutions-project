import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  summary: z.string().min(10, "Project summary should describe the work"),
});

export const resumeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email address"),
  phone: z.string().min(5, "Phone number is required"),
  education: z.array(z.string().min(1)).nonempty("Include at least one education entry"),
  skills: z.array(z.string().min(1)).nonempty("Include at least one skill"),
  projects: z.array(projectSchema).nonempty("Include at least one project entry"),
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
