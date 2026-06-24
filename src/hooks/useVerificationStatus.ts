import { useQuery } from "@tanstack/react-query";
import { getVerificationStatus, getVerificationStatusQuery } from "@/lib/verification/api";

export function useVerificationStatus(role: "students" | "sponsors", enabled = true) {
	return useQuery(getVerificationStatusQuery);
}
