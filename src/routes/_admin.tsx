import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { JSX } from "react";
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
	return (
		<div className="min-h-screen bg-background">
			<AdminSidebar />
			<div className="ml-60 p-6">
				<Outlet />
			</div>
		</div>
	);
}
