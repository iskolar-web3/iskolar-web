import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { useAuth } from "@/auth";

const navItems = [
	{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
	{ label: "Users", path: "/users", icon: Users },
];

export default function AdminSidebar() {
	const router = useRouterState();
	const navigate = useNavigate();
	const auth = useAuth();
	const currentPath = router.location.pathname;

	const handleLogout = async () => {
		await auth.logout();
		navigate({ to: "/login" });
	};

	return (
		<aside className="fixed top-0 left-0 h-screen w-60 bg-white border-r border-[#E0ECFF] flex flex-col z-40">
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
					onClick={handleLogout}
					className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
				>
					<LogOut className="w-5 h-5" />
					Logout
				</button>
			</div>
		</aside>
	);
}
