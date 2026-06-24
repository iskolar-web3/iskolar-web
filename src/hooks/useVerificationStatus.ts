import { useQuery } from "@tanstack/react-query";
import { getVerificationStatusQuery } from "@/lib/verification/api";

export function useVerificationStatus(_role: "students" | "sponsors", _enabled = true) {
	return useQuery(getVerificationStatusQuery);
}
