// Add legacy DOM augmentations used during the migration
declare global {
  interface MouseEvent {
    which?: number;
  }
}

export {};
