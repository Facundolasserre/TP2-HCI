export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function createPaginationMeta(total: number, page: number, per_page: number): PaginationMeta {
  const total_pages = Math.ceil(total / per_page);
  return {
    total,
    page,
    per_page,
    total_pages,
    has_next: page < total_pages,
    has_prev: page > 1
  };
}
