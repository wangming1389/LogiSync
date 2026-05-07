export type Id = string;
export type ISODate = string;

export type ApiResult<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
