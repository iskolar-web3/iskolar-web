import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import type { JSX } from "react";

export function NotFoundPage(): JSX.Element {
	return (
		<div
			className="flex min-h-screen flex-col items-center justify-end gap-8 px-4 py-22"
			style={{
				backgroundImage: "url('/404.png')",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Action Buttons */}
			<div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
				{/* Go Back Button */}
				<Button
					variant="outline"
					size="lg"
					onClick={() => window.history.back()}
					className="px-8 cursor-pointer bg-background hover:bg-background/80"
				>
					← Go Back
				</Button>

				{/* Go Home Button */}
				<Link to="/">
					<Button size="lg" className="px-8 cursor-pointer text-tertiary bg-secondary hover:bg-secondary/80">
						Go to Home
					</Button>
				</Link>
			</div>
		</div>
	);
}
