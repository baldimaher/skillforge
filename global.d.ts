declare global {
  interface Window {
    jspdf?: typeof import("jspdf");
  }
}