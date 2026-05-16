let counter = 0;

export const v4 = jest.fn(() => {
	counter += 1;
	return `00000000-0000-4000-8000-${counter.toString().padStart(12, '0')}`;
});
