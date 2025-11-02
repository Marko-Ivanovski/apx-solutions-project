const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function ensurePdfFile(file: File | null): File {
  if (!file) {
    throw new Error("File is required");
  }
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported");
  }
  if (file.size === 0) {
    throw new Error("Uploaded file is empty");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Uploaded file exceeds ${MAX_FILE_SIZE_MB}MB limit`);
  }
  return file;
}

export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
