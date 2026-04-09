import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import type { QueryClient } from "@tanstack/react-query";
import type { JSX } from "react";
import type { AuthContextValue } from "@/auth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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

			{import.meta.env.DEV && <ReactQueryDevtools />}
		</>
	);
}
