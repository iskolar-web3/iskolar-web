import { useEffect } from "react";
import { BACKEND_URL } from "../api";
import { NotificationType } from "./model";
import { useQueryClient } from "@tanstack/react-query";
import { getVerificationStatusQuery } from "../verification/api";
import { getMyNotificationsQuery } from "./api";

export function useNotificationListener(): void {
	const queryClient = useQueryClient();

	useEffect(() => {
		const url = new URL(`${BACKEND_URL}/sse`);
		const es = new EventSource(url.toString(), { withCredentials: true });

		for (const type of Object.values(NotificationType)) {
			es.addEventListener(type, () => {
				queryClient.invalidateQueries(getMyNotificationsQuery());
			});
		}

		for (const type of [
			NotificationType.VerificationApproved,
			NotificationType.VerificationDeclined,
		]) {
			es.addEventListener(type, () => {
				queryClient.invalidateQueries(getVerificationStatusQuery);
			});
		}

		return () => es.close();
	}, []);
}
