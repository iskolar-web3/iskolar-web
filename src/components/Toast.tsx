import { AnimatePresence, motion } from "framer-motion";
import { HiCheckCircle, HiXCircle } from "react-icons/hi2";
import type { JSX } from "react";
import { useToastStore } from "@/lib/toast";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
	visible: boolean;
	type: ToastType;
	title: string;
	message: string;
}

function Toast({ visible, type, title, message }: ToastProps): JSX.Element {
	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					initial={{ opacity: 0, x: 500 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 500 }}
					transition={{
						type: "spring",
						stiffness: 800,
						damping: 28,
					}}
					className={cn(
						"fixed top-4 md:top-6 right-4 z-1000 w-87.5 h-12.5 md:w-90 md:h-15 rounded-lg flex items-center justify-end shadow-lg",
						type === "success" ? "bg-success" : "bg-destructive",
					)}
				>
					<div className="flex items-center w-86.5 h-12.5 md:w-88.5 md:h-15 bg-background rounded-lg px-3 py-2 gap-3 opacity-80">
						<div className="flex items-center justify-center">
							{type === "success" ? (
								<HiCheckCircle className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-success" />
							) : (
								<HiXCircle className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-destructive" />
							)}
						</div>
						<div className="flex-1 text-left">
							<p className="text-sm md:text-base text-primary leading-tight">
								{title}
							</p>
							<p className="text-xs md:text-sm text-primary opacity-85 leading-tight">
								{message}
							</p>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export function Toaster(): JSX.Element {
	const state = useToastStore();
	return (
		<Toast
			visible={state?.visible ?? false}
			type={state?.type ?? "info"}
			title={state?.title ?? ""}
			message={state?.message ?? ""}
		/>
	);
}
