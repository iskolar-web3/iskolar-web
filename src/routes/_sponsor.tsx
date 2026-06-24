import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, type JSX } from "react";
import HeaderNav from "@/components/HeaderNav";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { UserRole } from "@/lib/user/model";
import { BACKEND_URL, getDefaultPathOfRole } from "@/lib/api";
import { getMyNotificationsQuery } from "@/lib/notification/api";
import { NotificationType } from "@/lib/notification/model";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVerificationStatusQuery } from "@/lib/verification/api";

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
	const queryClient = useQueryClient();

	useEffect(() => {
		const url = new URL(`${BACKEND_URL}/sse/scholarships`);
		const es = new EventSource(url.toString(), { withCredentials: true });

		for (const type of Object.values(NotificationType)) {
			es.addEventListener(type, () => {
				queryClient.invalidateQueries(getMyNotificationsQuery());
			});
		}

		for (const type of [
			NotificationType.VerificationApproved,
			NotificationType.VerificationDeclined,
		]) {
			es.addEventListener(type, () => {
				queryClient.invalidateQueries(getVerificationStatusQuery);
			});
		}

		return () => es.close();
	}, []);

	return (
		<div className="min-h-screen bg-background">
			<HeaderNav role="sponsor" notifications={notifications.data || []} />
			<div className="w-full px-4 md:px-14 pt-21 md:pt-24 pb-6">
				<Outlet />
			</div>
			<FeedbackWidget />
		</div>
	);
}
