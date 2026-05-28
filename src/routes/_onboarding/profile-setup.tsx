import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_onboarding/profile-setup")({
	component: () => <Outlet />,
});
