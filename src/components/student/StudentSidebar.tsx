import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
	Compass,
	FileText,
	HandCoins,
	Home,
	MessageSquareQuote,
} from "lucide-react";
import { getStudentDisbursementsQuery } from "@/lib/disbursement/api";
import { DisbursementStatus } from "@/lib/disbursement/model";

interface StudentNavItem {
	label: string;
	path: string;
	icon: React.ComponentType<{ className?: string }>;
}

const studentNavItems: StudentNavItem[] = [
	{ label: "Home", path: "/home", icon: Home },
	{ label: "Discover", path: "/discover", icon: Compass },
	{ label: "Funds", path: "/disbursements", icon: HandCoins },
	{ label: "Testimonials", path: "/testimonials", icon: MessageSquareQuote },
	{ label: "Reports", path: "/reports", icon: FileText },
];

/**
 * Static student navigation sidebar.
 * Always visible below the header — no collapse/expand toggle.
 */
export default function StudentSidebar() {
	const router = useRouterState();
	const currentPath = router.location.pathname;

	const disbursementsQuery = useQuery(getStudentDisbursementsQuery());
	const pendingDisbursementCount = (disbursementsQuery.data ?? []).filter(
		(d) => d.status === DisbursementStatus.Sent,
	).length;

	return (
		<aside className="fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-16 flex-col border-r border-[#E0ECFF] bg-white md:w-60">
			<nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 md:px-3">
				{studentNavItems.map((item) => {
					const Icon = item.icon;
					const isActive = currentPath === item.path;

					return (
						<Link
							key={item.path}
							to={item.path}
							className={`flex items-center justify-center gap-3 rounded-lg px-0 py-2.5 text-sm transition-colors md:justify-start md:px-3 ${
								isActive
									? "bg-[#E0ECFF] text-[#3A52A6] font-medium"
									: "text-[#6B7280] hover:bg-[#F0F7FF] hover:text-primary"
							}`}
							aria-label={item.label}
							title={item.label}
						>
							<span className="relative shrink-0">
								<Icon className="w-5 h-5" />
								{item.path === "/disbursements" &&
									pendingDisbursementCount > 0 && (
										<span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] text-white">
											{pendingDisbursementCount}
										</span>
									)}
							</span>
							<span className="hidden md:inline">{item.label}</span>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
