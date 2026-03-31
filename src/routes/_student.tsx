import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { JSX } from "react";
import HeaderNav from "@/components/HeaderNav";
import { UserRole } from "@/lib/user/model";
import { getDefaultPathOfRole } from "@/lib/api";
import { BetaNoticeModal } from "@/components/student/BetaNotice";
import { FeedbackWidget } from "@/components/FeedbackWidget";

export const Route = createFileRoute("/_student")({
	component: StudentLayout,
	beforeLoad: async ({ context }) => {
		let currentUser = context.auth.user;

		if (!currentUser) {
			const ses = await context.auth.getSession();
			if (!ses) {
				throw redirect({ to: "/login" });
			}

			currentUser = ses.user;
		}

		if (currentUser.role?.code !== UserRole.Student) {
			const path = getDefaultPathOfRole(currentUser);
			throw redirect({ to: path });
		}
	},
});

function StudentLayout(): JSX.Element {
	return (
		<div className="min-h-screen bg-background">
			<HeaderNav role="student" />
			<div className="w-full px-4 md:px-14 pt-21 md:pt-24 pb-6">
				<Outlet />
			</div>
			<BetaNoticeModal />
			<FeedbackWidget />
		</div>
	);
}
