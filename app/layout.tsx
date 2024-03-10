import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Navbar } from "@/components/Navbar";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
	title: "PomoLogs - Deep Work Focus Tracker",
	description: "A simple Pomodoro timer and task tracker",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				className={
					(poppins.className,
					"container max-w-screen-sm px-4 text-center space-y-4")
				}
			>
				<Navbar />
				{children}
				<Toaster position="bottom-center" />
			</body>
		</html>
	);
}
