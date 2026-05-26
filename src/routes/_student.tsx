import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, type JSX } from "react";
import HeaderNav from "@/components/HeaderNav";
import { UserRole } from "@/lib/user/model";
import { BACKEND_URL, getDefaultPathOfRole } from "@/lib/api";
import { BetaNoticeModal } from "@/components/student/BetaNotice";
import { PaymentMethodBanner } from "@/components/student/PaymentMethodBanner";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { getMyNotificationsQuery } from "@/lib/notification/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationType } from "@/lib/notification/model";
import type { ScholarshipCreatedEvent } from "@/lib/scholarship/model";

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
	const notifications = useQuery(getMyNotificationsQuery());
	const queryClient = useQueryClient();

	useEffect(() => {
		const es = new EventSource(`${BACKEND_URL}/sse/scholarships`, {
			withCredentials: true,
		});

		es.addEventListener(NotificationType.ScholarshipCreated, (e) => {
			const data = JSON.parse(e.data) as ScholarshipCreatedEvent;
			queryClient.invalidateQueries(getMyNotificationsQuery());
			console.log(data);
		});

		return () => es.close();
	}, []);

	return (
		<div className="min-h-screen bg-background">
			<HeaderNav role="student" notifications={notifications.data || []} />
			<div className="w-full px-4 md:px-14 pt-21 md:pt-24 pb-6">
				<PaymentMethodBanner />
				<Outlet />
			</div>
			<BetaNoticeModal />
			<FeedbackWidget />
		</div>
	);
}
