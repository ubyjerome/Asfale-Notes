export interface Note {
  id: string;
  title: string;
  content: string;
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

export type SortOption =
  | 'color'
  | 'created-desc'
  | 'created-asc'
  | 'updated-desc'
  | 'title-asc'
  | 'title-desc';

export type ViewMode = 'grid' | 'list' | 'detailed';
