import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// function which takes in a time in minutes + seconds and returns a string in the format of MM:SS, or HH:MM:SS if the time is over an hour
export function formatTime(time: number) {
	const roundedTime = Math.floor(time); // Round down to nearest second
	const hours = Math.floor(roundedTime / 3600);
	const minutes = Math.floor((roundedTime % 3600) / 60);
	const seconds = Math.floor(roundedTime % 60);

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")}`;
	} else {
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	}
}
