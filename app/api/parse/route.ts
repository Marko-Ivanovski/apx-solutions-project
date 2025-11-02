import { NextRequest } from "next/server";
import { respondBadRequest, respondServerError, respondSuccess } from "@/utils/response";
import { ensurePdfFile, fileToBuffer } from "@/utils/file";
import { extractTextFromPdf } from "@/lib/extract";
import { parseResumeWithGemini } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = ensurePdfFile(formData.get("file") as File | null);

    const pdfBuffer = await fileToBuffer(file);
    const resumeText = await extractTextFromPdf(pdfBuffer);

    const parsedResume = await parseResumeWithGemini(resumeText);
    return respondSuccess(parsedResume);
  } catch (error) {
    if (error instanceof Error) {
      const isClientError =
        error.message.includes("PDF") ||
        error.message.includes("File") ||
        error.message.includes("resume");

      return isClientError ? respondBadRequest(error.message) : respondServerError(error.message);
    }

    return respondServerError("Unexpected error while parsing resume");
  }
}
