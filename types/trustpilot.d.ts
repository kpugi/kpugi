export {};

declare global {
  interface Window {
    tp?: (...args: any[]) => void;
    TrustpilotObject?: string;
  }
}
