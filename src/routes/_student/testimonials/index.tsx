import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareQuote, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/auth";
import { SEO } from "@/components/SEO";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyApplicationsQuery } from "@/lib/scholarship/api";
import { ScholarshipApplicationStatus } from "@/lib/scholarship/status";
import type { Student } from "@/lib/student/model";
import {
	getMyTestimonialsQuery,
	withdrawTestimonial,
} from "@/lib/testimonial/api";
import type { Testimonial } from "@/lib/testimonial/model";
import { toast } from "@/lib/toast";
import { TestimonialFormDialog } from "./-components/TestimonialFormDialog";

export const Route = createFileRoute("/_student/testimonials/")({
	component: TestimonialsPage,
});

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-PH", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function TestimonialCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Skeleton className="h-5 w-40 bg-muted-foreground" />
				</CardTitle>
				<CardAction>
					<Skeleton className="h-5 w-16 rounded-full bg-muted-foreground" />
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<Skeleton className="h-4 w-full bg-muted-foreground" />
					<Skeleton className="h-4 w-full bg-muted-foreground" />
					<Skeleton className="h-4 w-2/3 bg-muted-foreground" />
				</div>
			</CardContent>
			<CardFooter className="justify-between">
				<Skeleton className="h-3 w-28 bg-muted-foreground" />
				<div className="flex gap-2">
					<Skeleton className="h-8 w-16 rounded-md bg-muted-foreground" />
					<Skeleton className="h-8 w-20 rounded-md bg-muted-foreground" />
				</div>
			</CardFooter>
		</Card>
	);
}

function TestimonialCard({
	testimonial,
	onEdit,
	onWithdraw,
}: {
	testimonial: Testimonial;
	onEdit: () => void;
	onWithdraw: () => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{testimonial.scholarship.name}</CardTitle>
				<CardAction>
					<Badge
						variant={testimonial.isSharedWithSponsor ? "default" : "secondary"}
					>
						{testimonial.isSharedWithSponsor ? "Shared" : "Private"}
					</Badge>
				</CardAction>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">{testimonial.content}</p>
			</CardContent>
			<CardFooter className="justify-between">
				<span className="text-xs text-muted-foreground">
					Submitted {formatDate(testimonial.createdAt)}
				</span>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={onEdit}>
						<Pencil data-icon="inline-start" />
						Edit
					</Button>
					<Button variant="outline" size="sm" onClick={onWithdraw}>
						<Trash2 data-icon="inline-start" />
						Withdraw
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}

function TestimonialsPage() {
	const auth = useAuth<Student>();
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<Testimonial | null>(null);
	const [withdrawing, setWithdrawing] = useState<Testimonial | null>(null);

	const queryClient = useQueryClient();

	const grantedQuery = useQuery(
		getMyApplicationsQuery({ status: ScholarshipApplicationStatus.Granted }),
	);
	const testimonialsQuery = useQuery(getMyTestimonialsQuery());

	const isLoading = grantedQuery.isLoading || testimonialsQuery.isLoading;
	const grantedApplications = grantedQuery.data ?? [];
	const testimonials = testimonialsQuery.data ?? [];
	const isEligible = grantedApplications.length > 0;

	const withdrawMutation = useMutation({
		mutationFn: withdrawTestimonial,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: getMyTestimonialsQuery().queryKey,
			});
			toast.success("Success", "Testimonial withdrawn.");
			setWithdrawing(null);
		},
		onError: (err) => toast.error("Error", err.message),
	});

	function openCreateDialog() {
		setEditing(null);
		setFormOpen(true);
	}

	function openEditDialog(testimonial: Testimonial) {
		setEditing(testimonial);
		setFormOpen(true);
	}

	return (
		<div className="min-h-screen">
			<SEO title="My Testimonials" noindex={true} />

			<div className="mx-auto max-w-3xl space-y-5">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-normal text-primary">My Testimonials</h1>
						<p className="mt-0.5 text-sm text-muted-foreground">
							Share how your scholarship made an impact, and give feedback to
							your sponsor.
						</p>
					</div>
					{isLoading ? (
						<Skeleton className="h-9 w-40 rounded-md bg-muted-foreground" />
					) : (
						isEligible && (
							<Button onClick={openCreateDialog}>Share Testimonial</Button>
						)
					)}
				</div>

				{isLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<TestimonialCardSkeleton key={`skel-${index}`} />
						))}
					</div>
				) : !isEligible ? (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<MessageSquareQuote />
							</EmptyMedia>
							<EmptyTitle>No active scholarships yet</EmptyTitle>
							<EmptyDescription>
								Once one of your scholarship applications is granted,
								you&apos;ll be able to share a testimonial about it here.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : testimonials.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<MessageSquareQuote />
							</EmptyMedia>
							<EmptyTitle>No testimonials yet</EmptyTitle>
							<EmptyDescription>
								Share your experience with the scholarships you&apos;ve
								received.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={openCreateDialog}>Share Testimonial</Button>
						</EmptyContent>
					</Empty>
				) : (
					<div className="space-y-3">
						{testimonials.map((testimonial) => (
							<TestimonialCard
								key={testimonial.id}
								testimonial={testimonial}
								onEdit={() => openEditDialog(testimonial)}
								onWithdraw={() => setWithdrawing(testimonial)}
							/>
						))}
					</div>
				)}
			</div>

			<TestimonialFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				studentId={auth.profile.id}
				grantedApplications={grantedApplications}
				editingTestimonial={editing}
			/>

			<AlertDialog
				open={!!withdrawing}
				onOpenChange={(next) => !next && setWithdrawing(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Withdraw testimonial?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently remove your testimonial for{" "}
							{withdrawing?.scholarship.name}. This can&apos;t be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={withdrawMutation.isPending}
							onClick={() =>
								withdrawing && withdrawMutation.mutate(withdrawing.id)
							}
						>
							{withdrawMutation.isPending ? "Withdrawing..." : "Withdraw"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
