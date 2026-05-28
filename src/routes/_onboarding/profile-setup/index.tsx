import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_onboarding/profile-setup/")({
	beforeLoad: () => {
		throw redirect({ to: "/role-selection" });
	},
	component: () => null,
});
