import { useState, useRef, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
	Search,
	Home,
	Compass,
	WalletCards,
	Plus,
	Bell,
	User,
	X,
	GraduationCap,
	HandCoins,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ProfileDropdown from "./profile/ProfileDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/auth";
import { getStudentDisbursementsQuery } from "@/lib/disbursement/api";
import { DisbursementStatus } from "@/lib/disbursement/model";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Notification } from "@/lib/notification/model";
import {
	formatTimeAgo,
	getNotificationMessage,
	getNotificationMetadata,
} from "@/lib/notification/helper";
import { Button } from "./ui/button";

/**
 * User role type for navigation context
 */
type UserRole = "student" | "sponsor";

/**
 * Navigation item structure
 */
interface NavItem {
	/** Display label for the navigation item */
	label: string;
	/** Route path for navigation */
	path: string;
	/** Icon component to display */
	icon: React.ComponentType<{ className?: string }>;
}

/**
 * Props for the HeaderNav component
 */
interface HeaderNavProps {
	/** Current user's role (student or sponsor) */
	role: UserRole;
	notifications: Notification[];
}

/**
 * Navigation items for student users
 */
const studentNavItems: NavItem[] = [
	{ label: "Home", path: "/home", icon: Home },
	{ label: "Discover", path: "/discover", icon: Compass },
	{ label: "Funds", path: "/disbursements", icon: HandCoins },
];

/**
 * Navigation items for sponsor users
 */
const sponsorNavItems: NavItem[] = [
	{ label: "Scholarships", path: "/scholarships", icon: WalletCards },
	{ label: "Scholars", path: "/scholars", icon: GraduationCap },
	{ label: "Create", path: "/create", icon: Plus },
];

/**
 * Main navigation header component
 * Provides role-based navigation, search functionality, notifications, and profile access
 * @param props - Component props
 * @returns Header navigation component
 */
export default function HeaderNav({ role, notifications = [] }: HeaderNavProps) {
	const router = useRouterState();
	const navigate = useNavigate();
	const currentPath = router.location.pathname;
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchExpanded, setIsSearchExpanded] = useState(false);
	const profileDropdownRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const searchContainerRef = useRef<HTMLDivElement>(null);

	const navItems = role === "student" ? studentNavItems : sponsorNavItems;
	const logoRedirectPath = role === "student" ? "/home" : "/scholarships";

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				profileDropdownRef.current &&
				!profileDropdownRef.current.contains(event.target as Node)
			) {
				setShowProfileDropdown(false);
			}

			// Close search when clicking outside on mobile
			if (
				searchContainerRef.current &&
				!searchContainerRef.current.contains(event.target as Node) &&
				isSearchExpanded
			) {
				setIsSearchExpanded(false);
				setSearchQuery("");
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isSearchExpanded]);

	// Focus input when search expands
	useEffect(() => {
		if (isSearchExpanded && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isSearchExpanded]);

	/**
	 * Handles logo click to navigate to role-specific home page
	 */
	const handleLogoClick = () => {
		navigate({ to: logoRedirectPath });
	};

	/**
	 * Handles search form submission
	 * @param e - Form event
	 */
	const handleSearchSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement search functionality
		console.log("Search query:", searchQuery);

		// await navigate({
		// 	search: (prev) => ({
		// 		...prev,
		// 		search: searchQuery,
		// 	}),
		// });
	};

	/**
	 * Expands the search bar on mobile devices
	 */
	const handleSearchIconClick = () => {
		setIsSearchExpanded(true);
	};

	/**
	 * Closes the expanded search bar and clears the query
	 */
	const handleSearchClose = () => {
		setIsSearchExpanded(false);
		setSearchQuery("");
	};

	/**
	 * Determines if a navigation route is currently active
	 * @param path - Route path to check
	 * @returns True if the route is active
	 */
	const isActiveRoute = (path: string) => {
		// Handle exact matches
		if (path === "/home") {
			return currentPath === "/home";
		}
		if (path === "/discover") {
			return currentPath === "/discover";
		}
		if (path === "/scholarships") {
			return (
				currentPath === "/scholarships" ||
				currentPath.startsWith("/scholarship/")
			);
		}
		if (path === "/scholars") {
			return currentPath === "/scholars";
		}
		if (path === "/create") {
			return currentPath === "/create";
		}
		if (path === "/disbursements") {
			return currentPath === "/disbursements";
		}
		if (path === "/transactions") {
			return currentPath === "/transactions";
		}
		return false;
	};

	const auth = useAuth();

	const studentDisbursementsQuery = useQuery(
		getStudentDisbursementsQuery(role === "student"),
	);
	const pendingDisbursementCount = (
		studentDisbursementsQuery.data ?? []
	).filter((d) => d.status === DisbursementStatus.Sent).length;

	return (
		<header className="fixed top-0 left-0 right-0 w-full bg-white border-b border-[#E0ECFF] z-50">
			<div className="w-full mx-auto px-4 md:px-14">
				<div className="flex items-center justify-between h-16 gap-4 relative">
					{/* Logo and Search */}
					<div className="flex items-center md:gap-4">
						{/* Logo */}
						<button
							type="button"
							onClick={handleLogoClick}
							className="shrink-0 cursor-pointer transition-opacity"
							aria-label="Go to home"
						>
							<img
								src="/logo.png"
								alt="iSkolar Logo"
								className="w-9 h-9 md:w-12 md:h-12"
							/>
						</button>

						{/* Search Bar - Desktop */}
						<div className="hidden md:block md:w-64">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
								<input
									type="text"
									placeholder="Search"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleSearchSubmit(e);
										}
									}}
									className="w-full pl-10 pr-4 py-2 rounded-lg border border-border text-sm text-primary placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
								/>
							</div>
						</div>

						{/* Search Icon - Mobile */}
						{!isSearchExpanded && (
							<button
								type="button"
								onClick={handleSearchIconClick}
								className="md:hidden p-2 text-[#9CA3AF] hover:text-primary transition-colors"
								aria-label="Search"
							>
								<Search className="w-4.5 h-4.5" />
							</button>
						)}
					</div>

					{/* Expanded Search Bar - Mobile */}
					{isSearchExpanded && (
						<div
							ref={searchContainerRef}
							className="absolute left-0 right-0 top-0 h-16 bg-white z-50 px-4 flex items-center gap-2 md:hidden"
						>
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
									<input
										ref={searchInputRef}
										type="text"
										placeholder="Search"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleSearchSubmit(e);
											}
										}}
										className="w-full pl-10 pr-4 py-2 rounded-md border border-border text-xs text-primary placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
									/>
								</div>
							</div>
							<button
								type="button"
								onClick={handleSearchClose}
								className="p-2 text-[#9CA3AF] hover:text-primary transition-colors"
								aria-label="Close search"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					)}

					{/* Navigation Links */}
					<div className="flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = isActiveRoute(item.path);

							return (
								<Link
									key={item.path}
									to={item.path}
									className="flex flex-col items-center gap-0.5 md:gap-1 transition-colors"
								>
									<span className="relative">
										<Icon
											className={`w-4 md:w-5 h-4 md:h-5 ${
												isActive ? "text-primary" : "text-[#9CA3AF]"
											}`}
										/>
										{item.path === "/disbursements" &&
											pendingDisbursementCount > 0 && (
												<span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] text-white">
													{pendingDisbursementCount}
												</span>
											)}
									</span>
									<span
										className={`text-[11px] md:text-xs ${
											isActive ? "text-primary" : "text-inactive"
										}`}
									>
										{item.label}
									</span>
								</Link>
							);
						})}
					</div>

					{/* Notifications and Profile */}
					<div className="flex items-center gap-1 md:gap-2 shrink-0">
						<Popover>
							<PopoverTrigger asChild>
								{/* Notification Bell */}
								<button
									type="button"
									className="relative p-2 cursor-pointer text-[#9CA3AF] hover:text-primary transition-colors"
									aria-label="Notifications"
								>
									<Bell className="w-4 md:w-5 h-4 md:h-5" />

									{notifications.length > 0 ? (
										<span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] text-white">
											{notifications.length}
										</span>
									) : null}
								</button>
							</PopoverTrigger>
							<PopoverContent align="end" className="h-[85vh] p-0 overflow-clip border-0">
								<PopoverHeader className="p-3 bg-secondary">
									<PopoverTitle className="text-xl text-secondary-foreground">Notifications</PopoverTitle>
								</PopoverHeader>

								<ScrollArea className="h-full space-y-2 ">
									{notifications.map((notif) => {
										const metadata = getNotificationMetadata(notif);
										const message = getNotificationMessage(notif);
										return (
											<Button
												variant="ghost"
												className="border-y border-muted flex-1 flex flex-col items-start gap-0 w-full py-2 px-3 h-auto space-y-2 whitespace-normal text-start rounded-none"
											>
												<div>
													<h1>{message}</h1>
													<p className="text-muted-foreground">
														{metadata?.name}
													</p>
												</div>

												<p className="text-secondary text-xs">
													{formatTimeAgo(metadata?.createdAt)}
												</p>
											</Button>
										);
									})}
								</ScrollArea>
							</PopoverContent>
						</Popover>

						{/* Profile Circle */}
						<div className="relative" ref={profileDropdownRef}>
							<button
								type="button"
								onClick={() => setShowProfileDropdown(!showProfileDropdown)}
								className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-muted flex items-center justify-center hover:ring-2 hover:ring-[#3A52A6] hover:ring-offset-2 transition-all cursor-pointer"
								aria-label="Profile menu"
							>
								<Avatar className="size-full">
									<AvatarImage src={auth.user?.avatarUrl || ""} />
									<AvatarFallback>
										<User className="w-4 md:w-5 h-4 md:h-5 text-[#6B7280]" />
									</AvatarFallback>
								</Avatar>
							</button>

							<AnimatePresence>
								{showProfileDropdown && (
									<ProfileDropdown
										onClose={() => setShowProfileDropdown(false)}
									/>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
