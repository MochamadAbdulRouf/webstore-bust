/**
 * Create a URL-friendly slug from a string
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Format file size from bytes to human readable
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Parse pagination parameters from query
 */
export const parsePagination = (query: Record<string, string | undefined>) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || '12', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build file URL from file path for serving
 */
export const buildFileUrl = (filePath: string): string => {
  return `/api/files/${filePath.replace(/\\/g, '/')}`;
};

/**
 * Calculate average rating
 */
export const calculateAvgRating = (ratings: number[]): number => {
  if (!ratings.length) return 0;
  const avg = ratings.reduce((acc, r) => acc + r, 0) / ratings.length;
  return Math.round(avg * 10) / 10;
};

/**
 * Omit password from user object
 */
export const omitPassword = <T extends { password?: string }>(user: T): Omit<T, 'password'> => {
  const { password: _, ...rest } = user;
  return rest;
};
