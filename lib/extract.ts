export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const globalWithPath2D = globalThis as { Path2D?: new (path?: string) => unknown };

  if (typeof globalWithPath2D.Path2D === "undefined") {
    class Path2DPolyfill {
      constructor(_: string | undefined = undefined) {}
    }

    globalWithPath2D.Path2D = Path2DPolyfill;
  }

  type PdfParseClass = {
    new (params: { data: Buffer }): {
      getText: () => Promise<{ text: string }>;
      destroy: () => Promise<void>;
    };
    setWorker?: (workerSrc?: string) => string;
  };

  const { PDFParse } = (await import("pdf-parse")) as unknown as {
    PDFParse: PdfParseClass;
    default?: never;
  };

  if (typeof PDFParse.setWorker === "function") {
    PDFParse.setWorker("pdfjs-dist/legacy/build/pdf.worker.mjs");
  }

  const parser = new PDFParse({ data: buffer });

  try {
    const textResult = await parser.getText();
    const cleaned = textResult.text.replace(/\s+/g, " ").trim();
    if (!cleaned) {
      throw new Error("Could not extract text from resume");
    }
    return cleaned;
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
