export const DB_NAME = 'narrata';

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const STORY_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const STORY_CATEGORIES = [
  'Fiction',
  'Non-Fiction', 
  'Romance',
  'Thriller',
  'Mystery',
  'Science Fiction',
  'Fantasy',
  'Horror',
  'Adventure',
  'Drama',
  'Comedy',
  'Biography',
  'Historical',
  'Other'
];

export const COMMENT_STATUS = {
  ACTIVE: 'active',
  HIDDEN: 'hidden',
  DELETED: 'deleted',
};

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  DOCUMENT: ['application/pdf', 'text/plain'],
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
