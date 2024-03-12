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
import { formatTime } from "@/lib/utils";
import HeatMap, { HeatMapValue } from "@uiw/react-heat-map";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

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
// TODO: add themes

// DONE: github style calendar for tracking
// TODO: LOGS ACCORDION
// TODO: && detailed logs on a separate page

const WorkTimer = () => {
	const requestRef = useRef<number>();
	const [initialTime, setInitialTime] = useState<number>(25 * 60);
	const [sort, setSort] = useState<"Most Recent" | "Oldest First">(
		"Most Recent"
	);
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
	const [heatmapValues, setHeatmapValues] = useState<HeatMapValue[]>([]);

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

	const countLogsByDate = () => {
		const dateCounts: any[] = [];
		logs.forEach((log) => {
			const logDate = new Date(log.date);
			const logDateString = `${logDate.getFullYear()}/${
				logDate.getMonth() + 1
			}/${logDate.getDate()}`;
			const existingDate = dateCounts.find(
				(dateCount) => dateCount.date === logDateString
			);
			if (existingDate) {
				existingDate.count += 1;
			} else {
				dateCounts.push({ date: logDateString, count: 1 });
			}
		});
		return dateCounts;
	};

	// each time logs is updated, save it to local storage
	useEffect(() => {
		if (logs.length === 0) return;
		localStorage.setItem("logs", JSON.stringify(logs));

		setHeatmapValues(countLogsByDate());
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
	}, [timer.isRunning, timer.time]);

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
				<div className="select-none">
					<p className="text-sm text-muted-foreground">Logs</p>
					<HeatMap
						value={heatmapValues}
						className="select-none w-full mx-auto"
						space={1.1}
						startDate={
							new Date(
								new Date().getUTCFullYear(),
								new Date().getUTCMonth() - 1,
								1
							)
						}
						endDate={new Date(new Date().getUTCFullYear(), 11, 31)}
						repeatCount={1}
						rectProps={{ rx: 2 }}
						legendCellSize={5}
						rectRender={(props, data) => {
							return (
								<rect
									opacity={new Date(data.date) > new Date() ? 0.5 : 1}
									{...props}
									onClick={() => {
										if (data.count > 0)
											toast(
												`You logged ${data.count} ${
													data.count > 1 ? "times" : "time"
												} on ${new Date(data.date).toLocaleDateString()}`
											);
									}}
								/>
							);
						}}
					/>
				</div>

				<Select
					onValueChange={(value: "Most Recent" | "Oldest First") =>
						setSort(value)
					}
					defaultValue="Most Recent"
					value={sort}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Sort by: " />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="Most Recent">Most Recent</SelectItem>
						<SelectItem value="Oldest First">Oldest First</SelectItem>
					</SelectContent>
				</Select>

				<Accordion type="single" collapsible>
					{countLogsByDate()
						.sort((a, b) => {
							return sort === "Most Recent"
								? new Date(b.date).getTime() - new Date(a.date).getTime()
								: new Date(a.date).getTime() - new Date(b.date).getTime();
						})
						.map((dateCount) => (
							<AccordionItem key={dateCount.date} value={dateCount.date}>
								<AccordionTrigger>{dateCount.date}</AccordionTrigger>
								<AccordionContent className="grid gap-4">
									{logs
										.filter((log) => {
											const logDate = new Date(log.date);
											const logDateString = `${logDate.getFullYear()}/${
												logDate.getMonth() + 1
											}/${logDate.getDate()}`;
											return logDateString === dateCount.date;
										})
										.map((log, i) => (
											<>
												<Card key={i}>
													<CardHeader>
														<CardTitle>{log.goal}</CardTitle>
														<CardDescription>
															<span className="font-medium underline">
																{new Date(log.date).toLocaleTimeString([], {
																	hour: "2-digit",
																	minute: "2-digit",
																})}
															</span>
															<br />
															{formatTime(log.timeSpent)} spent working
														</CardDescription>
													</CardHeader>
													<CardContent>
														<p>{log.notes}</p>
													</CardContent>
												</Card>
											</>
										))}
								</AccordionContent>
							</AccordionItem>
						))}
				</Accordion>
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
