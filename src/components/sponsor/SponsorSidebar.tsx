import { Link, useRouterState } from "@tanstack/react-router";
import {
	GraduationCap,
	LayoutDashboard,
	MessageSquareQuote,
	Plus,
	WalletCards,
} from "lucide-react";

interface SponsorNavItem {
	label: string;
	path: string;
	icon: React.ComponentType<{ className?: string }>;
}

const sponsorNavItems: SponsorNavItem[] = [
	{ label: "Dashboard", path: "/overview", icon: LayoutDashboard },
	{ label: "Scholarships", path: "/scholarships", icon: WalletCards },
	{ label: "Scholars", path: "/scholars", icon: GraduationCap },
	{
		label: "Testimonials",
		path: "/scholar-testimonials",
		icon: MessageSquareQuote,
	},
	{ label: "Create", path: "/create", icon: Plus },
];

/**
 * Static sponsor navigation sidebar.
 * Always visible below the header — no collapse/expand toggle.
 */
export default function SponsorSidebar() {
	const router = useRouterState();
	const currentPath = router.location.pathname;

	return (
		<aside className="fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-16 flex-col border-r border-[#E0ECFF] bg-white md:w-60">
			<nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 md:px-3">
				{sponsorNavItems.map((item) => {
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
							<Icon className="w-5 h-5 shrink-0" />
							<span className="hidden md:inline">{item.label}</span>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
