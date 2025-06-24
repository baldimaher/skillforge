declare module 'pdf-parse' {
  import { Buffer } from 'buffer';
declare module "pdf-parse" {
  interface PDFParseOptions {
    max?: number;
    pagerender?: (pageData: any) => Promise<string>;
  }
  interface PDFInfo {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }
  interface PDFParseResult {
    text: string;
    info: PDFInfo;
    metadata: any;
    version: string;
  }
  function pdf(buffer: Buffer): Promise<PDFParseResult>;
  export = pdf;
    text: string;
  }
  function pdfParse(data: Buffer | Uint8Array, options?: PDFParseOptions): Promise<PDFInfo>;
  export = pdfParse;
}
