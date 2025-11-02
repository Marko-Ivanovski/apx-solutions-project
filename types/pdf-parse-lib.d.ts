declare module "pdf-parse/lib/pdf-parse.js" {
  type PdfParseResult = {
    numpages: number;
    numrender: number;
    info: unknown;
    metadata: unknown;
    version: string;
    text: string;
  };

  function pdfParse(buffer: Buffer): Promise<PdfParseResult>;

  export default pdfParse;
}
