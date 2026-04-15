import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/auth";
import { UserRole } from "@/lib/user/model";

export const Route = createFileRoute("/verification/callback")({
	beforeLoad: async ({ context }) => {
		let currentUser = context.auth.user;

		if (!currentUser) {
			const ses = await context.auth.getSession();
			if (!ses) {
				throw redirect({ to: "/login" });
			}
		}
	},
	component: VerificationCallback,
});

function VerificationCallback() {
	const auth = useAuth();

	useEffect(() => {
		const profile = auth.profile;
		const role = auth.user?.role?.code;

		if (!profile?.id) return;

		if (role === UserRole.Student) {
			window.location.href = `/profile/student/${profile.id}?verified=1`;
		} else if (role === UserRole.Sponsor) {
			window.location.href = `/profile/sponsor/${profile.id}?verified=1`;
		} else {
			window.location.href = "/";
		}
	}, [auth.profile, auth.user]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<p className="text-muted-foreground">Redirecting...</p>
		</div>
	);
}
