import type { Moment } from "moment";

export const debounce = (fn: Function, ms = 300) => {
	let timeoutId: NodeJS.Timeout;
	return function (...args: unknown[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			fn(...args);
		}, ms);
	};
};

export function compareByDate(a: Moment | null, b: Moment | null): -1 | 0 | 1 {
	if (a !== null && b === null) {
		return -1;
	}
	if (a === null && b !== null) {
		return 1;
	}
	if (!(a !== null && b !== null)) {
		return 0;
	}

	if (a.isValid() && !b.isValid()) {
		return 1;
	} else if (!a.isValid() && b.isValid()) {
		return -1;
	}

	if (a.isAfter(b)) {
		return 1;
	} else if (a.isBefore(b)) {
		return -1;
	} else {
		return 0;
	}
}
