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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { motion } from "framer-motion";

interface TimerProps {
	time: number;
	isRunning: boolean;
	finished: boolean;
	type: "work" | "break";
}

interface LogProps {
	goal: string;
	timeSpent: number;
	notes: string;
	date: Date;
}
// TODO: add pause functionality (better left to an external library.)
// TODO: add log delete functionality
// TODO: add themes
// TODO: github style calendar for tracking
//		 && detailed logs on a separate page

const WorkTimer = () => {
	const requestRef = useRef<number>();
	const [initialTime, setInitialTime] = useState<number>(25 * 60);
	// timer state
	const [timer, setTimer] = useState<TimerProps>({
		type: "work",
		time: initialTime,
		isRunning: false,
		finished: false,
	});
	// log state
	const [log, setLog] = useState<LogProps>({
		goal: "",
		timeSpent: 0,
		notes: "",
		date: new Date(),
	});

	// log history state
	const [logs, setLogs] = useState<LogProps[]>([]);

	// start timer function
	const handleStart = () => {
		if (timer.time === 0 || log.goal.trim() === "")
			return toast.error("You must set a goal and time to start the timer!");

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
						setLog({ ...log, timeSpent: initialTime });
						document.title = "PomoLogs - Deep Work Tracker";
						return {
							time: 0,
							isRunning: false,
							finished: true,
							type: prev.type,
						};
					}

					setLog({ ...log, timeSpent: initialTime - newTime });
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
		setTimer({
			...timer,
			isRunning: false,
			finished: true,
		});
		document.title = "PomoLogs - Deep Work Tracker";
		if (requestRef.current) {
			cancelAnimationFrame(requestRef.current);
		}
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

	// each time logs is updated, save it to local storage
	useEffect(() => {
		if (logs.length === 0) return;
		localStorage.setItem("logs", JSON.stringify(logs));
	}, [logs]);

	useEffect(() => {
		if (logs.length === 0) {
			const logsToSet = JSON.parse(localStorage.getItem("logs") || "[]");
			setLogs(logsToSet);
		} else if (timer.isRunning) {
			document.title = `${formatTime(timer.time)} - ${log.goal}`;
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
						{Math.floor(log.timeSpent / 60)
							.toString()
							.padStart(2, "0")}
						:{(log.timeSpent % 60).toString().padStart(2, "0")}
					</>
				)}
			</div>
			{/* card */}
			<Card>
				<CardHeader>
					<CardTitle>
						{timer.isRunning ? `${log.goal}` : "What's your goal?"}
					</CardTitle>
					<CardDescription>
						{timer.isRunning
							? "You're doing great! Keep it up!"
							: "Set a goal and start the timer"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
						<div className="flex gap-4">
							{/* goal input */}
							<Input
								placeholder="What's your goal?"
								value={!timer.isRunning ? log.goal : ""}
								disabled={timer.isRunning}
								onChange={(e) => {
									setLog({ ...log, goal: e.target.value });
								}}
							/>

							{/* number input */}
							<Input
								type="number"
								placeholder="Minutes"
								className="max-w-24 text-center"
								defaultValue={initialTime / 60}
								disabled={timer.isRunning}
								min={0}
								max={300}
								onChange={(e) => {
									if (parseInt(e.target.value) > 300) {
										e.target.value = "300";
										setTimer({
											...timer,
											time: 300 * 60,
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
			<div className="space-y-4">
				{logs.length > 0 &&
					logs.map((log, i = 1) => (
						<Card key={i} className="mt-4">
							<CardHeader>
								<CardTitle>
									#{i}: {log.goal}
								</CardTitle>
								<CardDescription>
									{new Date(log.date).toLocaleDateString()}
									<br />
									{Math.floor(log.timeSpent / 60)
										.toString()
										.padStart(2, "0")}
									:{(log.timeSpent % 60).toString().padStart(2, "0")} spent
									working
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p>{log.notes}</p>
							</CardContent>
						</Card>
					))}
			</div>
			<Dialog
				open={timer.finished && log.goal.trim() !== "" && !timer.isRunning}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Log: {log.goal}</DialogTitle>
						<DialogDescription>
							Awesome work! Add some notes to track your progress! 🎉
						</DialogDescription>
					</DialogHeader>
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							toast.success("Logged!");
							setLogs([...logs, { ...log }]);
							setLog({ goal: "", timeSpent: 0, notes: "", date: new Date() });
							setTimer({
								...timer,
								time: initialTime,
								isRunning: false,
								finished: false,
							});
						}}
					>
						<Input
							placeholder="Write some notes here..."
							value={log.notes}
							onChange={(e) => {
								setLog({ ...log, notes: e.target.value });
								handleStop();
							}}
						/>
						<Button type="submit">Log it!</Button>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export { WorkTimer };

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
			return toast.error("You must set a time to start the timer.");

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
		setTimer({
			...timer,
			time: initialTime,
			isRunning: false,
			finished: true,
		});
		document.title = "PomoLogs - Deep Work Tracker";
		if (requestRef.current) {
			cancelAnimationFrame(requestRef.current);
		}
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
				<>{formatTime(timer.time)}</>
			</div>
			{/* card */}
			<Card>
				<CardHeader>
					<CardTitle>
						{timer.isRunning ? "Take it easy." : "Time for a break?"}
					</CardTitle>
					<CardDescription>
						{timer.isRunning
							? "You're doing great! Keep it up!"
							: "Set the time and relax."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
						<div className="flex justify-center gap-4">
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
											time: 300 * 60,
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
									Back to work?
								</Button>
							</>
						) : (
							<Button onClick={handleStart}>Take a breather</Button>
						)}
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
