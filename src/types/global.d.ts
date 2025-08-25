declare var root: HTMLDivElement;

interface Navigator {
  msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
}

interface HTMLElement {
  jssWorksheet?: any;
  jspreadsheet?: any;
}

interface Window {
  clipboardData?: any;
}
