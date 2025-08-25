declare var root: HTMLDivElement;

interface Navigator {
  msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
}
