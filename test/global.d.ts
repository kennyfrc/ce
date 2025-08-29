// Global type definitions for test environment
declare global {
  var root: HTMLDivElement;

  interface Window {
    jss: typeof import('./index').default;
    instance: ReturnType<typeof import('./index').default>;
  }
}

export {};
