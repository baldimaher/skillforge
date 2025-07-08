declare module 'pdf-parse' {
  import { Buffer } from 'buffer';

  interface PDFParseOptions {
    max?: number;
    pagerender?: (pageData: any) => Promise<string> | string;
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

  function pdfParse(data: Buffer | Uint8Array, options?: PDFParseOptions): Promise<PDFParseResult>;

  export = pdfParse;
}
