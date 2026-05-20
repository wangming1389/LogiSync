export interface PagePaginationInput {
	page?: number | string | null;
	limit?: number | string | null;
}

export interface OffsetPaginationInput {
	offset?: number | string | null;
	limit?: number | string | null;
}

export interface PagePagination {
	page: number;
	limit: number;
	offset: number;
}

export interface OffsetPagination {
	offset: number;
	limit: number;
	page: number;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	offset: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const DEFAULT_MAX_LIMIT = 100;

export function normalizePagePagination(
	input: PagePaginationInput = {},
	options: { defaultLimit?: number; maxLimit?: number } = {},
): PagePagination {
	const limit = normalizeLimit(
		input.limit,
		options.defaultLimit ?? DEFAULT_LIMIT,
		options.maxLimit ?? DEFAULT_MAX_LIMIT,
	);
	const page = Math.max(1, toInteger(input.page, DEFAULT_PAGE));

	return {
		page,
		limit,
		offset: (page - 1) * limit,
	};
}

export function normalizeOffsetPagination(
	input: OffsetPaginationInput = {},
	options: { defaultLimit?: number; maxLimit?: number } = {},
): OffsetPagination {
	const limit = normalizeLimit(
		input.limit,
		options.defaultLimit ?? DEFAULT_LIMIT,
		options.maxLimit ?? DEFAULT_MAX_LIMIT,
	);
	const offset = Math.max(0, toInteger(input.offset, 0));

	return {
		offset,
		limit,
		page: Math.floor(offset / limit) + 1,
	};
}

export function buildPaginationMeta(
	pagination: PagePagination | OffsetPagination,
	total: number,
): PaginationMeta {
	const safeTotal = Math.max(0, Number(total) || 0);
	const totalPages =
		safeTotal === 0 ? 0 : Math.ceil(safeTotal / pagination.limit);
	const offset = pagination.offset;
	const page =
		'page' in pagination && pagination.page > 0
			? pagination.page
			: Math.floor(offset / pagination.limit) + 1;

	return {
		page,
		limit: pagination.limit,
		offset,
		total: safeTotal,
		totalPages,
		hasNextPage: offset + pagination.limit < safeTotal,
		hasPreviousPage: offset > 0,
	};
}

export function createPaginatedResponse<T>(
	items: T[],
	total: number,
	pagination: PagePagination | OffsetPagination,
) {
	return {
		items,
		meta: buildPaginationMeta(pagination, total),
	};
}

function normalizeLimit(
	value: number | string | null | undefined,
	defaultLimit: number,
	maxLimit: number,
): number {
	const limit = toInteger(value, defaultLimit);
	return Math.min(Math.max(1, limit), Math.max(1, maxLimit));
}

function toInteger(
	value: number | string | null | undefined,
	fallback: number,
): number {
	if (value === null || value === undefined || value === '') return fallback;
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return fallback;
	return Math.trunc(parsed);
}
