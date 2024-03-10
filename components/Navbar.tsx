"use client";

import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";

const Navbar = () => {
	const pathname = usePathname();

	return (
		<nav className="h-12 border-b border-accent flex justify-between items-center backdrop-blur">
			<span className="text-xl sm:text-2xl font-extrabold flex items-center leading-none cursor-default select-none">
				<p className="hover:-rotate-6 hover:scale-110 transition mr-2">🍅🪵</p>
				<p>PomoLogs</p>
			</span>
			<div className="flex gap-4 items-center">
				<Button
					size={"sm"}
					variant={pathname === "/" ? "default" : "ghost"}
					asChild
				>
					<Link href="/">Work</Link>
				</Button>
				<Button
					asChild
					size={"sm"}
					variant={pathname === "/break" ? "default" : "ghost"}
				>
					<Link href="/break">Break</Link>
				</Button>
			</div>
		</nav>
	);
};

export { Navbar };
