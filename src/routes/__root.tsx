import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { JSX } from "react";
import type { AuthContextValue } from "@/auth";
import { Toaster } from "@/components/Toast";
import { NotFoundPage } from "./__404";

type RouterContext = {
	queryClient: QueryClient;
	auth: AuthContextValue;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RouteComponent,
	notFoundComponent: NotFoundPage,
});

function RouteComponent(): JSX.Element {
	return (
		<>
			<Outlet />
			<Toaster />
			{import.meta.env.DEV && <ReactQueryDevtools />}
		</>
	);
}
