"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface TimerProps {
	time: number;
	isRunning: boolean;
	finished: boolean;
	type: "work" | "break";
}

const BreakTimer = () => {
	const requestRef = useRef<number>();
	const [initialTime, setInitialTime] = useState<number>(5 * 60);
	// timer state
	const [timer, setTimer] = useState<TimerProps>({
		type: "work",
		time: initialTime,
		isRunning: false,
		finished: false,
	});

	// start timer function
	const handleStart = () => {
		if (timer.time === 0)
			return toast.error("You must set a time to start the timer!");

		setTimer({
			...timer,
			isRunning: true,
			finished: false,
		});

		const startTime = performance.now();
		let previousTime = 0;

		const animate = (currentTime: number) => {
			const deltaTime = (currentTime - startTime) / 1000;

			if (deltaTime - previousTime >= 1) {
				setTimer((prev: TimerProps) => {
					const newTime = Math.max(prev.time - 1, 0);

					if (newTime === 0) {
						document.title = "PomoLogs - Deep Work Tracker";
						return {
							time: 0,
							isRunning: false,
							finished: true,
							type: prev.type,
						};
					}

					return { ...prev, time: newTime };
				});

				previousTime += 1;
			}

			if (timer.time > 0 && !timer.finished) {
				requestRef.current = requestAnimationFrame(animate);
			}
		};

		requestRef.current = requestAnimationFrame(animate);
	};

	// stop timer function
	const handleStop = () => {
		document.title = "PomoLogs - Deep Work Tracker";
		if (requestRef.current) {
			cancelAnimationFrame(requestRef.current);
		}
		setTimer({
			...timer,
			time: initialTime,
			isRunning: false,
			finished: false,
		});
	};

	// function which takes in a time in minutes + seconds and returns a string in the format of MM:SS, or HH:MM:SS if the time is over an hour
	const formatTime = (time: number) => {
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
	};

	useEffect(() => {
		if (timer.isRunning) {
			document.title = `Break Time - ${formatTime(timer.time)} left	`;
		} else {
			document.title = "PomoLogs - Deep Work Tracker";
		}
	}, [timer.isRunning]);

	return (
		<div className="space-y-4">
			{/* timer */}
			<div className="tabular-nums select-none mx-auto size-64 flex items-center justify-center rounded-full relative text-4xl font-semibold tracking-wider">
				<motion.svg className="absolute inset-0 h-full w-full">
					<motion.circle
						className="h-full w-full"
						cx="50%"
						cy="50%"
						r="48%"
						stroke="none"
						strokeWidth="4"
						fill="none"
						strokeLinecap={"round"}
						initial={{
							stroke: "#000",
							rotate: -90,
							pathLength: 1,
						}}
						animate={{
							stroke: timer.isRunning ? "#f00" : "#000",
							pathLength: timer.isRunning ? timer.time / initialTime : 1,
						}}
						transition={{ duration: 0.75 }}
					></motion.circle>
				</motion.svg>
				{timer.isRunning || initialTime ? (
					<>{formatTime(timer.time)}</>
				) : (
					<>
						{Math.floor(timer.time / 60)
							.toString()
							.padStart(2, "0")}
						:{(timer.time % 60).toString().padStart(2, "0")}
					</>
				)}
			</div>
			{/* card */}
			<Card>
				<CardHeader>
					<CardTitle>
						{timer.isRunning ? "Kick your feet up!" : "Time for a break?"}
					</CardTitle>
					<CardDescription>
						{timer.isRunning
							? "Take a break, you deserve it."
							: "How long will you rest for?"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
						<div className="flex gap-4 justify-center">
							{/* number input */}
							<Input
								type="number"
								placeholder="Minutes"
								className="max-w-24 text-center"
								defaultValue={initialTime / 60}
								disabled={timer.isRunning}
								min={0}
								max={60}
								onChange={(e) => {
									if (parseInt(e.target.value) > 60) {
										e.target.value = "60";
										setTimer({
											...timer,
											time: 60 * 60,
											isRunning: false,
											finished: false,
										});
									} else if (parseInt(e.target.value) < 0) {
										e.target.value = "0";
										setTimer({
											...timer,
											time: 0,
											isRunning: false,
											finished: false,
										});
									} else {
										setInitialTime(e.target.valueAsNumber * 60);
										setTimer({
											...timer,
											time: e.target.valueAsNumber * 60,
											isRunning: false,
											finished: false,
										});
									}
								}}
							/>
						</div>

						{timer.isRunning ? (
							<>
								<Button variant={"destructive"} onClick={handleStop}>
									Stop Working
								</Button>
							</>
						) : (
							<Button onClick={handleStart}>Let&apos;s Get To Work!</Button>
						)}
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export { BreakTimer };
