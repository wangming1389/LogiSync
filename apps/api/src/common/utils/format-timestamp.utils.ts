export function formatTimestamp(date: Date): string {
	const yyyy = date.getFullYear();
	const dd = String(date.getDate()).padStart(2, '0');
	const HH = String(date.getHours()).padStart(2, '0');
	const mm = String(date.getMinutes()).padStart(2, '0');
	const ss = String(date.getSeconds()).padStart(2, '0');

	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	const monthName = months[date.getMonth()];

	return `${dd} ${monthName} ${yyyy} - ${HH}:${mm}:${ss}`;
}
