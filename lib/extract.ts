export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfModule = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse =
    (pdfModule.default as ((data: Buffer) => Promise<{ text: string }>)) ??
    (pdfModule as unknown as (data: Buffer) => Promise<{ text: string }>);

  const result = await pdfParse(buffer);
  const cleaned = result.text.replace(/\s+/g, " ").trim();

  if (!cleaned) {
    throw new Error("Could not extract text from resume");
  }

  return cleaned;
}
