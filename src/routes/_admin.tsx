import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { JSX } from "react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { UserRole } from "@/lib/user/model";
import { getDefaultPathOfRole } from "@/lib/api";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const Route = createFileRoute("/_admin")({
	component: AdminLayout,
	beforeLoad: async ({ context }) => {
		let currentUser = context.auth.user;

		if (!currentUser) {
			const ses = await context.auth.getSession();
			if (!ses) {
				throw redirect({ to: "/login" });
			}

			currentUser = ses.user;
		}

		if (currentUser.role?.code !== UserRole.Admin) {
			const path = getDefaultPathOfRole(currentUser);
			throw redirect({ to: path });
		}
	},
});

function AdminLayout(): JSX.Element {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="min-h-screen bg-background">
			<AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
			<div className="lg:ml-60">
				{/* Mobile top bar */}
				<div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#E0ECFF] bg-white px-4 lg:hidden">
					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						className="rounded-lg p-1.5 text-[#6B7280] hover:bg-[#F0F7FF] hover:text-primary transition-colors"
					>
						<Menu className="h-5 w-5" />
					</button>
					<img src="/logo.png" alt="iSkolar Logo" className="h-7 w-7" />
					<span className="text-secondary">iSkolar</span>
					<span className="ml-auto text-[10px] font-medium bg-[#3A52A6] text-white px-2 py-0.5 rounded-full">
						Admin
					</span>
				</div>
				<div className="p-4 sm:p-6">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
