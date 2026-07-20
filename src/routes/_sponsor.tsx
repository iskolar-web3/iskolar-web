import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { type JSX } from "react";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import HeaderNav from "@/components/HeaderNav";
import SponsorSidebar from "@/components/sponsor/SponsorSidebar";
import { getDefaultPathOfRole } from "@/lib/api";
import { getMyNotificationsQuery } from "@/lib/notification/api";
import { useNotificationListener } from "@/lib/notification/hook";
import { UserRole } from "@/lib/user/model";

export const Route = createFileRoute("/_sponsor")({
	component: SponsorLayout,
	beforeLoad: async ({ context }) => {
		let currentUser = context.auth.user;

		if (!currentUser) {
			const ses = await context.auth.getSession();
			if (!ses) {
				throw redirect({ to: "/login" });
			}

			currentUser = ses.user;
		}

		if (currentUser.role?.code !== UserRole.Sponsor) {
			const path = getDefaultPathOfRole(currentUser);
			throw redirect({ to: path });
		}
	},
});

function SponsorLayout(): JSX.Element {
	const notifications = useQuery(getMyNotificationsQuery());

	useNotificationListener();

	return (
		<div className="min-h-screen bg-background">
			<HeaderNav role="sponsor" notifications={notifications.data || []} />
			<SponsorSidebar />
			<div className="pl-16 md:pl-60">
				<div className="w-full px-2 md:px-6 pt-18 md:pt-21 pb-6">
					<Outlet />
				</div>
			</div>
			<FeedbackWidget />
		</div>
	);
}
