import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareQuote } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/auth";
import { SEO } from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyScholarshipsQuery } from "@/lib/scholarship/api";
import type { AnySponsor } from "@/lib/sponsor/model";
import { getSponsorTestimonialsQuery } from "@/lib/testimonial/api";
import type { Testimonial } from "@/lib/testimonial/model";

export const Route = createFileRoute("/_sponsor/scholar-testimonials/")({
	component: SponsorTestimonialsPage,
});

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-PH", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
	const { student } = testimonial;
	const initials =
		`${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-3">
					<Avatar className="size-10 shrink-0">
						<AvatarImage src={student.avatarUrl ?? ""} />
						<AvatarFallback className="bg-[#EEF2FF] text-sm font-medium text-primary">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<CardTitle className="truncate">
							{student.firstName} {student.lastName}
						</CardTitle>
						<p className="truncate text-xs text-muted-foreground">
							{testimonial.scholarship.name} · Submitted{" "}
							{formatDate(testimonial.createdAt)}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">{testimonial.content}</p>
			</CardContent>
		</Card>
	);
}

function SponsorTestimonialsPage() {
	const auth = useAuth<AnySponsor>();
	const [scholarshipId, setScholarshipId] = useState("all");

	const scholarshipsQuery = useQuery(
		getMyScholarshipsQuery({ sponsorId: auth.profile?.id ?? "" }),
	);
	const testimonialsQuery = useQuery(
		getSponsorTestimonialsQuery(
			scholarshipId === "all" ? undefined : scholarshipId,
		),
	);

	const scholarships = scholarshipsQuery.data ?? [];
	const testimonials = testimonialsQuery.data ?? [];

	return (
		<div className="min-h-screen">
			<SEO title="Scholar Testimonials" noindex={true} />

			<div className="mx-auto max-w-3xl space-y-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl text-primary">Scholar Testimonials</h1>
						<p className="mt-0.5 text-sm text-muted-foreground">
							Feedback your scholars have chosen to share with you.
						</p>
					</div>

					{scholarships.length > 1 && (
						<Select value={scholarshipId} onValueChange={setScholarshipId}>
							<SelectTrigger className="w-full sm:w-56">
								<SelectValue placeholder="Filter by scholarship" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Scholarships</SelectItem>
								{scholarships.map((s) => (
									<SelectItem key={s.id} value={s.id}>
										{s.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>

				{testimonialsQuery.isLoading ? (
					<div className="space-y-3">
						{["skel-1", "skel-2"].map((key) => (
							<Skeleton key={key} className="h-32 w-full rounded-lg" />
						))}
					</div>
				) : testimonials.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<MessageSquareQuote />
							</EmptyMedia>
							<EmptyTitle>No testimonials yet</EmptyTitle>
							<EmptyDescription>
								{scholarshipId === "all"
									? "Testimonials your scholars share with you will show up here."
									: "No testimonials have been shared for this scholarship yet."}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<div className="space-y-3">
						{testimonials.map((testimonial) => (
							<TestimonialCard key={testimonial.id} testimonial={testimonial} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
