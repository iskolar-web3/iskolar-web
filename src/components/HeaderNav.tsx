import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { BadgeCheck, Bell, BookOpen, HandCoins, Star, Trophy, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	getMyNotificationsQuery,
	markMyNotificationsAsReadMutation,
} from "@/lib/notification/api";
import {
	formatTimeAgo,
	getNotificationSubtitle,
	getNotificationTitle,
} from "@/lib/notification/helper";
import type { Notification } from "@/lib/notification/model";
import { NotificationType } from "@/lib/notification/model";
import ProfileDropdown from "./profile/ProfileDropdown";

function getNotificationIcon(notif: Notification) {
	switch (notif.notificationType.code) {
		case NotificationType.ScholarshipCreated:
			return <BookOpen className="w-5 h-5 text-foreground" />;
		case NotificationType.ApplicationShortlisted:
			return <Star className="w-5 h-5 text-foreground" />;
		case NotificationType.ApplicationApproved:
			return <BadgeCheck className="w-5 h-5 text-foreground" />;
		case NotificationType.ApplicationGranted:
			return <HandCoins className="w-5 h-5 text-foreground" />;
		case NotificationType.ScholarshipEndedSelected:
			return <Trophy className="w-5 h-5 text-foreground" />;
		case NotificationType.ScholarshipEndedNotSelected:
			return <BookOpen className="w-5 h-5 text-foreground" />;
		default:
			return <Bell className="w-5 h-5 text-foreground" />;
	}
}

/**
 * User role type for navigation context
 */
type UserRole = "student" | "sponsor";

/**
 * Props for the HeaderNav component
 */
interface HeaderNavProps {
	/** Current user's role (student or sponsor) */
	role: UserRole;
	notifications: Notification[];
}

/**
 * Main navigation header component
 * Provides the logo, notifications, and profile access
 * Role-specific navigation lives in the sidebar (see SponsorSidebar / StudentSidebar)
 * @param props - Component props
 * @returns Header navigation component
 */
export default function HeaderNav({ role, notifications }: HeaderNavProps) {
	const navigate = useNavigate();
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);
	const profileDropdownRef = useRef<HTMLDivElement>(null);

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
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	/**
	 * Handles logo click to navigate to role-specific home page
	 */
	const handleLogoClick = () => {
		navigate({ to: logoRedirectPath });
	};

	const [isNotifOpen, setIsNotifOpen] = useState(false);
	const queryClient = useQueryClient();
	const markAsRead = useMutation({
		...markMyNotificationsAsReadMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries(getMyNotificationsQuery());
		},
	});

	const handleNotifOpenChange = (open: boolean) => {
		setIsNotifOpen(open);
		if (open && notifications.some((n) => !n.isRead)) {
			markAsRead.mutate();
		}
	};

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const auth = useAuth();

	return (
		<header className="fixed top-0 left-0 right-0 w-full bg-white border-b border-[#E0ECFF] z-50">
			<div className="w-full mx-auto px-4 md:px-14">
				<div className="flex items-center justify-between h-16 gap-4 relative">
					{/* Logo */}
					<button
						type="button"
						onClick={handleLogoClick}
						className="shrink-0 cursor-pointer transition-opacity"
						aria-label="Go to home"
					>
						<img
							src="/logo2.png"
							alt="iSkolar Logo"
							className="h-8 w-auto md:h-10"
						/>
					</button>

					{/* Notifications and Profile */}
					<div className="flex items-center gap-1 md:gap-2 shrink-0">
						<Popover open={isNotifOpen} onOpenChange={handleNotifOpenChange}>
							<PopoverTrigger asChild>
								{/* Notification Bell */}
								<button
									type="button"
									className="relative p-2 cursor-pointer text-[#9CA3AF] hover:text-primary transition-colors"
									aria-label="Notifications"
								>
									<Bell className="w-4 md:w-5 h-4 md:h-5" />

									{unreadCount > 0 ? (
										<span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] text-white">
											{unreadCount}
										</span>
									) : null}
								</button>
							</PopoverTrigger>
							<PopoverContent
								align="end"
								className="w-80 p-0 overflow-clip shadow-lg border border-border"
							>
								<div className="px-4 py-3 border-b border-border">
									<h2 className="text-sm text-primary">Notifications</h2>
									{unreadCount > 0 && (
										<p className="text-xs text-muted-foreground mt-0.5">
											{unreadCount} unread
										</p>
									)}
								</div>

								<div className="max-h-[420px] overflow-y-auto">
									{notifications.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-12 px-4 gap-2 text-muted-foreground">
											<Bell className="w-7 h-7 opacity-25" />
											<p className="text-sm">No notifications yet</p>
										</div>
									) : (
										notifications.map((notif) => {
											const title = getNotificationTitle(notif);
											const subtitle = getNotificationSubtitle(notif);
											return (
												<div
													key={notif.notificationId}
													className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors ${!notif.isRead ? "bg-primary/4" : ""}`}
												>
													<div className="shrink-0 mt-0.5">
														{getNotificationIcon(notif)}
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-primary leading-snug">
															{title}
														</p>
														{subtitle && (
															<p className="text-xs text-muted-foreground mt-0.5 leading-snug">
																{subtitle}
															</p>
														)}
													</div>
													<div className="flex flex-col items-end gap-1 shrink-0">
														<span className="text-[10px] text-muted-foreground whitespace-nowrap">
															{formatTimeAgo(notif.createdAt)}
														</span>
														{!notif.isRead && (
															<span className="w-2 h-2 rounded-full bg-primary" />
														)}
													</div>
												</div>
											);
										})
									)}
								</div>
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
