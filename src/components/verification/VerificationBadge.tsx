import { ShieldCheck } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
	verifiedAt?: Date | null;
};

export default function VerificationBadge({ verifiedAt }: Props) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="inline-flex items-center gap-1 text-green-600">
						<ShieldCheck className="w-4 h-4" />
					</span>
				</TooltipTrigger>
				<TooltipContent>
					<p className="text-xs">
						Identity verified
						{verifiedAt && (
							<>
								{" "}
								on{" "}
								{new Date(verifiedAt).toLocaleDateString(undefined, {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</>
						)}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
