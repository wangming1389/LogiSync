export function formatDateTime(
	value: string | number | Date | null | undefined,
) {
	if (value === null || value === undefined || value === '') return '--';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '--';

	return new Intl.DateTimeFormat('vi-VN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	}).format(date);
}

export function formatTime(value: string | number | Date | null | undefined) {
	if (value === null || value === undefined || value === '') return '--';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '--';

	return new Intl.DateTimeFormat('vi-VN', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	}).format(date);
}
