import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { type JSX } from "react";
import HeaderNav from "@/components/HeaderNav";
import StudentSidebar from "@/components/student/StudentSidebar";
import { UserRole } from "@/lib/user/model";
import { getDefaultPathOfRole } from "@/lib/api";
import { PaymentMethodBanner } from "@/components/student/PaymentMethodBanner";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { getMyNotificationsQuery } from "@/lib/notification/api";
import { useQuery } from "@tanstack/react-query";
import { useNotificationListener } from "@/lib/notification/hook";

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

	useNotificationListener();

	return (
		<div className="min-h-screen bg-background">
			<HeaderNav role="student" notifications={notifications.data || []} />
			<StudentSidebar />
			<div className="pl-16 md:pl-60">
				<div className="w-full px-2 md:px-6 pt-18 md:pt-21 pb-6">
					<PaymentMethodBanner />
					<Outlet />
				</div>
			</div>
			<FeedbackWidget />
		</div>
	);
}
