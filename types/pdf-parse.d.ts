declare module 'pdf-parse' {
  import { Buffer } from 'buffer';
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
}
