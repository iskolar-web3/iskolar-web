import { validateVerificationToken } from "@/lib/user/auth";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { JSX } from "react";
import { z } from "zod";

const searchSchema = z.object({
	token: z.string(),
});

export const Route = createFileRoute("/_auth/verify")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent(): JSX.Element {
	const search = Route.useSearch();
	const tokenQuery = useQuery({
		queryKey: ["email-verification-token", search.token],
		queryFn: () => validateVerificationToken(search.token),
		enabled: !!search.token,
		retry: false,
		staleTime: Number.POSITIVE_INFINITY,
	});

	if (tokenQuery.isLoading) {
		return <div>looding</div>;
	}

	if (tokenQuery.isError) {
		return <div>error</div>;
	}

	return (
		<div>
			<p>Account verified!</p>
			<Link to="/login">Go to Login</Link>
		</div>
	);
}
