export interface SyncedNote {
  id: string;
  encryptedTitle: string;
  encryptedContent: string;
  color: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
}
