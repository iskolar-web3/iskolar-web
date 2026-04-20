import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "@/auth";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const navItems = [
	{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
	{ label: "Users", path: "/users-management", icon: Users },
	{ label: "Scholarships", path: "/scholarships-management", icon: GraduationCap },
];

interface AdminSidebarProps {
	open: boolean;
	onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
	const router = useRouterState();
	const navigate = useNavigate();
	const auth = useAuth();
	const currentPath = router.location.pathname;
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

	useEffect(() => {
		onClose();
	}, [currentPath]);

	const handleLogoutClick = () => {
		setIsLogoutDialogOpen(true);
	};

	const handleConfirmLogout = async () => {
		setIsLogoutDialogOpen(false);
		await auth.logout();
		navigate({ to: "/login" });
	};

	return (
		<>
			{/* Mobile overlay */}
			{open && (
				<div
					className="fixed inset-0 z-30 bg-black/40 lg:hidden"
					onClick={onClose}
				/>
			)}
			<aside
				className={`fixed top-0 left-0 h-screen w-60 bg-white border-r border-[#E0ECFF] flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="flex items-center gap-2 px-5 py-4 border-b border-[#E0ECFF]">
					<img src="/logo.png" alt="iSkolar Logo" className="w-9 h-9" />
					<span className="text-lg text-secondary">iSkolar</span>
					<span className="ml-auto text-[10px] font-medium bg-[#3A52A6] text-white px-2 py-0.5 rounded-full">
						Admin
					</span>
				</div>

				<nav className="flex-1 px-3 py-4 space-y-1">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = currentPath === item.path;

						return (
							<Link
								key={item.path}
								to={item.path}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
									isActive
										? "bg-[#E0ECFF] text-[#3A52A6] font-medium"
										: "text-[#6B7280] hover:bg-[#F0F7FF] hover:text-primary"
								}`}
							>
								<Icon className="w-5 h-5" />
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div className="px-3 py-4 border-t border-[#E0ECFF]">
					<div className="px-3 py-2 mb-2">
						<p className="text-xs text-[#9CA3AF] truncate">
							{auth.user?.email}
						</p>
					</div>
					<button
						type="button"
						onClick={handleLogoutClick}
						className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
					>
						<LogOut className="w-5 h-5" />
						Logout
					</button>
				</div>
			</aside>

			<Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="font-normal">Confirm Logout</DialogTitle>
						<DialogDescription className="text-foreground">
							Are you sure you want to log out? You will need to log in again to access the admin panel.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsLogoutDialogOpen(false)}
							className="cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleConfirmLogout}
							className="cursor-pointer"
						>
							Logout
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
