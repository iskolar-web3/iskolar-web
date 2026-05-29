import { useState, useEffect, type JSX } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import ApplicationDetailsModal from "@/components/student/home/ApplicationDetailsDrawer";
import { toast } from "@/lib/toast";
import {
	ScholarshipApplicationStatus,
	type Application,
} from "@/lib/scholarship/model";
import { useQuery } from "@tanstack/react-query";
import { getMyApplicationsQuery } from "@/lib/scholarship/api";
import z from "zod";
import { HomeSkeleton } from "./-components/skeleton";
import { FilterType } from "./-model";
import { HomeHeader } from "./-components/header";
import { HomeApplications } from "./-components/applications";
import { HomeEmpty } from "./-components/empty";

const searchSchema = z.object({
	status: z.enum(FilterType).default(FilterType.All),
});

export const Route = createFileRoute("/_student/home/")({
	component: Home,
	validateSearch: searchSchema,
});

function Home(): JSX.Element {
	const [selectedApplication, setSelectedApplication] =
		useState<Application | null>(null);
	const search = useSearch({ from: "/_student/home/" });

	const applicationsQuery = useQuery(
		getMyApplicationsQuery({
			status: getEquivalentStatus(search.status),
		}),
	);

	const applications = applicationsQuery.data;

	useEffect(() => {
		if (applicationsQuery.isError) {
			toast.error("Error", applicationsQuery.error.message, 2500);
		}
	}, [applicationsQuery.isError]);

	return (
		<main className="min-h-screen">
			<SEO title="Home" noindex={true} />
			<div className="max-w-176 mx-auto space-y-12">
				<HomeHeader />

				{applicationsQuery.isLoading ? (
					<div>
						{Array.from({ length: 4 }).map((_, i) => (
							<HomeSkeleton key={i} index={i} />
						))}
					</div>
				) : !applications || applications.length === 0 ? (
					<HomeEmpty />
				) : (
					<HomeApplications
						applications={applications}
						setSelectedApplication={setSelectedApplication}
					/>
				)}
			</div>

			<AnimatePresence>
				{selectedApplication && (
					<ApplicationDetailsModal
						application={selectedApplication}
						onClose={() => setSelectedApplication(null)}
					/>
				)}
			</AnimatePresence>
		</main>
	);
}

function getEquivalentStatus(filter: FilterType): string {
	if (filter === FilterType.All) {
		return "";
	}

	if (filter === FilterType.Applied) {
		return `${ScholarshipApplicationStatus.Pending},${ScholarshipApplicationStatus.Shortlisted}`;
	}

	if (filter === FilterType.Past) {
		return `${ScholarshipApplicationStatus.Approved},${ScholarshipApplicationStatus.Denied}`;
	}

	return ScholarshipApplicationStatus.Granted;
}
