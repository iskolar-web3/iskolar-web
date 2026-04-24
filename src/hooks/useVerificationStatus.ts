import { useQuery } from "@tanstack/react-query";
import { getVerificationStatus } from "@/lib/verification/api";

export function useVerificationStatus(role: "students" | "sponsors", enabled = true) {
	return useQuery({
		queryKey: ["verification-status", role],
		queryFn: () => getVerificationStatus(role),
		staleTime: 30_000,
		enabled,
	});
}
