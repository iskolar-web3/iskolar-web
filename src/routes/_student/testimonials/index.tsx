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
import { Gender, type Student } from "@/lib/student/model";
import {
	getMyTestimonialsQuery,
	withdrawTestimonial,
} from "@/lib/testimonial/api";
import type { Testimonial } from "@/lib/testimonial/model";
import { toast } from "@/lib/toast";
import { ContactType } from "@/lib/user/model";
import { TestimonialFormDialog } from "./-components/TestimonialFormDialog";

export const Route = createFileRoute("/_student/testimonials/")({
	component: TestimonialsPage,
});

// #region TEMP_MOCK_DATA — delete this block plus the two lines tagged
// "TEMP: mock" below to remove the design preview data.
const MOCK_STUDENT: Student = {
	id: "mock-student",
	userId: "mock-user",
	firstName: "Maria",
	middleName: null,
	lastName: "Santos",
	birthDate: new Date("2003-05-14"),
	gender: { id: 1, name: "Female", code: Gender.Female },
	school: null,
	educationLevel: null,
	schoolName: "Polytechnic University of the Philippines",
	contact: {
		id: "mock-contact",
		name: "Mobile",
		code: ContactType.Phone,
		value: "09171234567",
	},
	avatarUrl: null,
	email: "maria.santos@example.com",
};

const MOCK_TESTIMONIALS: Testimonial[] = [
	{
		id: "mock-testimonial-1",
		createdAt: new Date("2026-05-02"),
		updatedAt: new Date("2026-05-02"),
		content:
			"This scholarship covered my tuition and gave me room to focus on my thesis instead of picking up part-time work. I'm graduating on time because of it.",
		isSharedWithSponsor: true,
		scholarship: { id: "mock-scholarship-1", name: "Tomorrow Fund Scholarship" },
		student: MOCK_STUDENT,
	},
	{
		id: "mock-testimonial-2",
		createdAt: new Date("2026-03-18"),
		updatedAt: new Date("2026-03-18"),
		content:
			"Applying was straightforward and the funds came through faster than I expected. It made a real difference for my family this semester.",
		isSharedWithSponsor: false,
		scholarship: { id: "mock-scholarship-2", name: "STEM Access Grant" },
		student: MOCK_STUDENT,
	},
];
// #endregion TEMP_MOCK_DATA

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-PH", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
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

	const grantedApplications = grantedQuery.data ?? [];
	const testimonials = MOCK_TESTIMONIALS; // TEMP: mock — restore to `testimonialsQuery.data ?? []`
	const isEligible = true; // TEMP: mock — restore to `grantedApplications.length > 0`

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
						<h1 className="text-2xl text-primary">My Testimonials</h1>
						<p className="mt-0.5 text-sm text-muted-foreground">
							Share how your scholarship made an impact, and give feedback to
							your sponsor.
						</p>
					</div>
					{isEligible && (
						<Button onClick={openCreateDialog}>Share Testimonial</Button>
					)}
				</div>

				{grantedQuery.isLoading || testimonialsQuery.isLoading ? (
					<div className="space-y-3">
						{["skel-1", "skel-2"].map((key) => (
							<Skeleton key={key} className="h-40 w-full rounded-lg" />
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
