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
		if (auth.isLoading) return;

		const profile = auth.profile;
		const role = auth.user?.role?.code;
		const profileId = profile?.id;

		if (!profileId || typeof profileId !== "string") return;

		if (role === UserRole.Student) {
			window.location.href = `/profile/student/${profileId}?verified=1`;
		} else if (role === UserRole.Sponsor) {
			window.location.href = `/profile/sponsor/${profileId}?verified=1`;
		} else {
			window.location.href = "/";
		}
	}, [auth.isLoading, auth.profile, auth.user]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<p className="text-muted-foreground">Redirecting...</p>
		</div>
	);
}
