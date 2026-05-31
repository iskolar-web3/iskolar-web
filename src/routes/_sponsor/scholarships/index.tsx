import { useState, useMemo, useEffect } from "react";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import {
	Filter,
	X,
	GraduationCap,
	Plus,
	AlertCircle,
	Loader2,
	LockKeyhole,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import FilterSelect from "./-components/Filters";
import ScholarshipCard from "./-components/ScholarshipCard";
import ScholarshipCardSkeleton from "@/components/ScholarshipCardSkeleton";
import ScholarshipDetailsModal from "./-components/ScholarshipDetailsDrawer";
import { SEO } from "@/components/SEO";
import { toast } from "@/lib/toast";
import {
	deleteScholarship,
	getMyScholarshipsQuery,
} from "@/lib/scholarship/api";
import { useAuth } from "@/auth";
import { SponsorType, type AnySponsor } from "@/lib/sponsor/model";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { useAnimateOnce } from "@/hooks/useAnimateOnce";
import { VerificationStatus } from "@/lib/verification/model";
import {
	getScholarshipQueryParamSchema,
	type Scholarship,
} from "@/lib/scholarship/model";

export const Route = createFileRoute("/_sponsor/scholarships/")({
	component: Scholarships,
	validateSearch: getScholarshipQueryParamSchema,
});

function Scholarships() {

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// Page-entrance animations should only play once per session, not on every
	// navigation back to this page.
	const headerAnim = useAnimateOnce("sponsor-scholarships:header");
	const filtersAnim = useAnimateOnce("sponsor-scholarships:filters");
	const sectionAnim = useAnimateOnce("sponsor-scholarships:section");

	const [sortBy, setSortBy] = useState("Newest");
	const [scholarshipType, setScholarshipType] = useState("All");
	const [applicationsRange, setApplicationsRange] = useState({
		min: "",
		max: "",
	});
	const [amountRange, setAmountRange] = useState({ min: "", max: "" });
	const [slotRange, setSlotRange] = useState({ min: "", max: "" });
	const [selectedScholarship, setSelectedScholarship] =
		useState<Scholarship | null>(null);
	const [showFiltersModal, setShowFiltersModal] = useState(false);
	const [scholarshipToDelete, setScholarshipToDelete] = useState<Scholarship | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showTitleModal, setShowTitleModal] = useState(false);
	const [titleInput, setTitleInput] = useState("");
	const [loading, setLoading] = useState(false);

	const search = useSearch({ from: "/_sponsor/scholarships/" });

	const auth = useAuth<AnySponsor>();

	const verificationEnabled = import.meta.env.VITE_ENABLE_IDENTITY_VERIFICATION === "true";
	const isIndividualSponsor = auth.profile?.sponsorType?.code === SponsorType.Individual;
	const verificationQuery = useVerificationStatus("sponsors", verificationEnabled && isIndividualSponsor);
	const isVerified =
		!verificationEnabled ||
		!isIndividualSponsor ||
		verificationQuery.isLoading ||
		verificationQuery.data?.status === VerificationStatus.Verified;

	const scholarships = useSuspenseQuery(
		getMyScholarshipsQuery(auth.sessionToken, {
			...search,
			sponsorId: auth.profile?.id ?? "",
		}),
	);


	const handleViewApplicants = (scholarship: Scholarship) => {
		navigate({
			to: "/scholarship/$id/applicants",
			params: { id: scholarship.id },
		});
	};

	const handleEdit = (scholarship: Scholarship) => {
		navigate({
			to: "/scholarship/$id/edit",
			params: { id: scholarship.id },
		});
	};

	const handleDeleteClick = (scholarship: Scholarship) => {
		setScholarshipToDelete(scholarship);
		setShowDeleteModal(true);
	};

	const proceedToTitleConfirm = () => {
		setShowDeleteModal(false);
		setTitleInput("");
		setShowTitleModal(true);
	};

	const confirmDelete = async () => {
		try {
			setLoading(true);
			if (scholarshipToDelete) {
				deleteMutation.mutate(scholarshipToDelete.id);
			}
			setShowTitleModal(false);
		} catch (error) {
			console.error("Delete error:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteFromModal = (scholarship: Scholarship) => {
		deleteMutation.mutate(scholarship.id);
		setSelectedScholarship(null);
	};

	const deleteMutation = useMutation({
		mutationFn: deleteScholarship,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["scholarships"] });
			toast.success("Success", "Scholarship deleted successfully", 2000);
		},
		onError: (err) => {
			toast.error("Error", err.message);
			console.error(err);
		},
	});

	useEffect(() => {
		if (scholarships.isError) {
			toast.error("Error", scholarships.error.message, 2500);
		}
	}, [scholarships.isError, scholarships.error]);

	const filteredScholarships = useMemo(() => {
		return scholarships.data.filter((scholarship) => {
			const matchesType =
				scholarshipType === "All" ||
				scholarship.scholarshipType.code === scholarshipType.toLowerCase();

			const amountPerScholar =
				scholarship.totalAmount && scholarship.totalSlots
					? scholarship.totalAmount / scholarship.totalSlots
					: 0;

			const matchesApplications =
				(!applicationsRange.min ||
					(scholarship.applicationCount !== undefined &&
						scholarship.applicationCount >= Number(applicationsRange.min))) &&
				(!applicationsRange.max ||
					(scholarship.applicationCount !== undefined &&
						scholarship.applicationCount <= Number(applicationsRange.max)));

			const matchesAmount =
				(!amountRange.min || amountPerScholar >= Number(amountRange.min)) &&
				(!amountRange.max || amountPerScholar <= Number(amountRange.max));

			const matchesSlots =
				(!slotRange.min || (scholarship.totalSlots ?? 0) >= Number(slotRange.min)) &&
				(!slotRange.max || (scholarship.totalSlots ?? 0) <= Number(slotRange.max));

			return (
				matchesType &&
				matchesApplications &&
				matchesAmount &&
				matchesSlots
			);
		});
	}, [
		scholarships,
		scholarshipType,
		applicationsRange,
		amountRange,
		slotRange,
	]);

	return (
		<div className="min-h-screen">
			<SEO title="My Scholarships" noindex={true} />
			{/* Mobile/Tablet Layout */}
			<div className="lg:hidden space-y-2">
				<motion.div
					initial={headerAnim.shouldAnimate ? { opacity: 0, y: -20 } : false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					onAnimationComplete={headerAnim.markAnimated}
					className="bg-card rounded-md text-center p-2 border border-[#D3DCF6] shadow-sm"
				>
					<p className="text-base text-primary tracking-wide">
						My Scholarships
					</p>
				</motion.div>

				<motion.div
					initial={headerAnim.shouldAnimate ? { opacity: 0, y: -20 } : false}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: headerAnim.shouldAnimate ? 0.1 : 0 }}
					className="bg-white rounded-md p-2 shadow-sm"
				>
					<button
						onClick={() => setShowFiltersModal(true)}
						className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-[#3A52A6] text-tertiary rounded-md hover:bg-[#2f4389] transition-colors"
					>
						<Filter size={16} />
						<span className="text-xs md:text-md">Filters</span>
					</button>
				</motion.div>
			</div>

			{/* Mobile Filters */}
			<AnimatePresence>
				{showFiltersModal && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setShowFiltersModal(false)}
							className="lg:hidden fixed inset-0 bg-black/50 z-40"
						/>

						{/* Bottom Sheet */}
						<motion.div
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							transition={{ type: "spring", damping: 30, stiffness: 300 }}
							className="lg:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl shadow-2xl z-50 max-h-[85vh] overflow-hidden"
						>
							{/* Header */}
							<div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-white">
								<div className="flex items-center gap-2">
									<Filter size={18} className="text-primary" />
									<h2 className="text-base text-primary">Filters</h2>
								</div>
								<button
									onClick={() => setShowFiltersModal(false)}
									className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
								>
									<X size={18} className="text-[#6B7280]" />
								</button>
							</div>

							{/* Filters Content */}
							<div className="overflow-y-auto p-4 pb-6 max-h-[calc(85vh-72px)]">
								<FilterSelect
									title="Sort By"
									options={[
										"Newest",
										"Oldest",
										"Deadline: Nearest",
										"Deadline: Farthest",
										"Amount: High to Low",
										"Amount: Low to High",
										"Slots: Most to Least",
										"Slots: Least to Most",
										"A → Z",
										"Z → A",
									]}
									value={sortBy}
									onChange={setSortBy}
								/>

								<FilterSelect
									title="Scholarship Type"
									options={["All", "Merit-Based", "Skill-Based"]}
									value={scholarshipType}
									onChange={setScholarshipType}
								/>

								<div className="mb-4">
									<label className="block text-xs text-primary mb-2">
										Applications
									</label>
									<div className="flex gap-2">
										<input
											type="number"
											placeholder="Min"
											value={applicationsRange.min}
											onChange={(event) =>
												setApplicationsRange((prev) => ({
													...prev,
													min: event.target.value,
												}))
											}
											className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
										/>
										<span className="flex items-center text-[#6B7280]">to</span>
										<input
											type="number"
											placeholder="Max"
											value={applicationsRange.max}
											onChange={(event) =>
												setApplicationsRange((prev) => ({
													...prev,
													max: event.target.value,
												}))
											}
											className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
										/>
									</div>
								</div>

								<div className="mb-4">
									<label className="block text-xs text-primary mb-2">
										Amount per Scholar
									</label>
									<div className="flex gap-2">
										<input
											type="number"
											placeholder="Min"
											value={amountRange.min}
											onChange={(event) =>
												setAmountRange((prev) => ({
													...prev,
													min: event.target.value,
												}))
											}
											className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
										/>
										<span className="flex items-center text-[#6B7280]">to</span>
										<input
											type="number"
											placeholder="Max"
											value={amountRange.max}
											onChange={(event) =>
												setAmountRange((prev) => ({
													...prev,
													max: event.target.value,
												}))
											}
											className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
										/>
									</div>
								</div>

								<div className="mb-2">
									<label className="block text-xs text-primary mb-2">
										Slots
									</label>
									<div className="flex gap-2">
										<input
											type="number"
											placeholder="Min"
											value={slotRange.min}
											onChange={(event) =>
												setSlotRange((prev) => ({
													...prev,
													min: event.target.value,
												}))
											}
											className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
										/>
										<span className="flex items-center text-[#6B7280]">to</span>
										<input
											type="number"
											placeholder="Max"
											value={slotRange.max}
											onChange={(event) =>
												setSlotRange((prev) => ({
													...prev,
													max: event.target.value,
												}))
											}
											className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
										/>
									</div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			<div className="space-y-4 mt-4 lg:mt-0">
				<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
					<motion.aside
						initial={filtersAnim.shouldAnimate ? { opacity: 0, x: -20 } : false}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4 }}
						onAnimationComplete={filtersAnim.markAnimated}
						className="hidden lg:block"
					>
						<div className="h-fit sticky top-4">
							<div className="bg-card rounded-md text-center p-4 border border-[#D3DCF6] shadow-sm mb-2">
								<p className="text-xl text-primary tracking-wide">
									My Scholarships
								</p>
							</div>

							<div className="bg-card rounded-md border border-[#D3DCF6] shadow-[0_20px_40px_rgba(17,24,39,0.04)]">
								<div className="p-6">
									<div className="flex items-center gap-2 mb-6">
										<Filter size={20} className="text-primary" />
										<h2 className="text-md text-primary">Filters</h2>
									</div>

									<FilterSelect
										title="Sort By"
										options={[
											"Newest",
											"Oldest",
											"Deadline: Nearest",
											"Deadline: Farthest",
											"Amount: High to Low",
											"Amount: Low to High",
											"Slots: Most to Least",
											"Slots: Least to Most",
											"A → Z",
											"Z → A",
										]}
										value={sortBy}
										onChange={setSortBy}
									/>

									<FilterSelect
										title="Scholarship Type"
										options={["All", "Merit-Based", "Skill-Based"]}
										value={scholarshipType}
										onChange={setScholarshipType}
									/>

									<div className="mb-6">
										<label className="block text-sm text-primary mb-2">
											Applications
										</label>
										<div className="flex gap-2">
											<input
												type="number"
												placeholder="Min"
												value={applicationsRange.min}
												onChange={(event) =>
													setApplicationsRange((prev) => ({
														...prev,
														min: event.target.value,
													}))
												}
												className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
											/>
											<span className="flex items-center text-[#6B7280]">
												to
											</span>
											<input
												type="number"
												placeholder="Max"
												value={applicationsRange.max}
												onChange={(event) =>
													setApplicationsRange((prev) => ({
														...prev,
														max: event.target.value,
													}))
												}
												className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
											/>
										</div>
									</div>

									<div className="mb-6">
										<label className="block text-sm text-primary mb-2">
											Amount per Scholar
										</label>
										<div className="flex gap-2">
											<input
												type="number"
												placeholder="Min"
												value={amountRange.min}
												onChange={(event) =>
													setAmountRange((prev) => ({
														...prev,
														min: event.target.value,
													}))
												}
												className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
											/>
											<span className="flex items-center text-[#6B7280]">
												to
											</span>
											<input
												type="number"
												placeholder="Max"
												value={amountRange.max}
												onChange={(event) =>
													setAmountRange((prev) => ({
														...prev,
														max: event.target.value,
													}))
												}
												className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
											/>
										</div>
									</div>

									<div>
										<label className="block text-sm text-primary mb-2">
											Slots
										</label>
										<div className="flex gap-2">
											<input
												type="number"
												placeholder="Min"
												value={slotRange.min}
												onChange={(event) =>
													setSlotRange((prev) => ({
														...prev,
														min: event.target.value,
													}))
												}
												className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
											/>
											<span className="flex items-center text-[#6B7280]">
												to
											</span>
											<input
												type="number"
												placeholder="Max"
												value={slotRange.max}
												onChange={(event) =>
													setSlotRange((prev) => ({
														...prev,
														max: event.target.value,
													}))
												}
												className="w-full px-3 py-2 bg-white border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:border-transparent"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.aside>

					<motion.section
						initial={sectionAnim.shouldAnimate ? { opacity: 0, y: 20 } : false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						onAnimationComplete={sectionAnim.markAnimated}
						className="space-y-5"
					>
						<div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
							{scholarships.isLoading ? (
								Array.from({ length: 6 }).map((_, index) => (
									<ScholarshipCardSkeleton
										key={`skeleton-${index}`}
										index={index}
									/>
								))
							) : filteredScholarships.length === 0 ? (
								<div className="xl:col-span-2 flex flex-col items-center justify-center pt-24 md:pt-32">
									<GraduationCap className="w-24 md:w-30 h-24 md:h-30 text-[#D1D5DB]" />
									<p className="mt-5 text-lg md:text-xl text-[#9CA3AF]">
										No scholarships yet
									</p>
									<p className="max-w-xl text-sm md:text-base text-[#9CA3AF] mt-2 mb-4 md:mb-6">
										Create scholarship programs to help students succeed.
									</p>
									<span title={!isVerified ? "Verify your identity to create a scholarship" : undefined}>
										<button
											onClick={() => navigate({ to: "/create" })}
											disabled={!isVerified}
											className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9CA3AF] text-tertiary text-sm md:text-base rounded-md hover:bg-muted-foreground hover:text-tertiary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{!isVerified ? <LockKeyhole size={18} /> : <Plus size={18} />}
											Create Scholarship
										</button>
									</span>
								</div>
							) : (
								filteredScholarships.map((scholarship, index) => (
									<ScholarshipCard
										key={scholarship.id}
										scholarship={scholarship}
										index={index}
										onClick={() => setSelectedScholarship(scholarship)}
										onEdit={handleEdit}
										onDelete={handleDeleteClick}
										onViewApplicants={handleViewApplicants}
									/>
								))
							)}
						</div>
					</motion.section>
				</div>
			</div>

			{selectedScholarship && (
				<ScholarshipDetailsModal
					scholarship={selectedScholarship}
					onClose={() => setSelectedScholarship(null)}
					onEdit={handleEdit}
					onDelete={handleDeleteFromModal}
					onViewApplicants={handleViewApplicants}
				/>
			)}

			{/* Delete Confirmation Modal */}
			<Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
				<DialogContent
					className="bg-tertiary border-0 py-4 px-6 w-[400px]"
					showCloseButton={true}
				>
					<DialogHeader>
						<div className="text-center">
							<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-1 text-[#EF4444]">
								<AlertCircle size={38} />
							</div>
							<h3 className="text-lg text-primary mb-2">Delete Scholarship</h3>
							<p className="text-sm text-[#6B7280] mb-6">
								Are you sure you want to delete{" "}
								<span className="text-primary font-medium">"{scholarshipToDelete?.name}"</span>?
								This action cannot be undone.
							</p>
						</div>
					</DialogHeader>
					<DialogFooter className="flex gap-3">
						<button
							onClick={() => setShowDeleteModal(false)}
							className="flex-1 px-4 py-2 cursor-pointer text-sm bg-tertiary border border-[#D1D5DB] text-[#374151] rounded-md hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={proceedToTitleConfirm}
							className="flex-1 px-4 py-2 cursor-pointer text-sm text-tertiary bg-[#EF4444] rounded-md transition-colors hover:bg-[#DC2626]"
						>
							Continue
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Title Confirmation Modal */}
			<Dialog open={showTitleModal} onOpenChange={(open) => { if (!open) { setShowTitleModal(false); setTitleInput(""); } }}>
				<DialogContent
					className="bg-tertiary border-0 py-4 px-6 w-[400px]"
					showCloseButton={true}
				>
					<DialogHeader>
						<div className="text-center">
							<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-1 text-[#EF4444]">
								<AlertCircle size={38} />
							</div>
							<h3 className="text-lg text-primary mb-2">Confirm Deletion</h3>
							<p className="text-sm text-[#374151] font-medium mb-4">
								Type this to confirm deletion:
							</p>
							<p
								onClick={() => {
									if (scholarshipToDelete?.name) {
										navigator.clipboard.writeText(scholarshipToDelete.name);
										toast.success("Copied", "Scholarship name copied to clipboard", 1500);
									}
								}}
								className="text-xs font-medium text-primary mb-4 bg-[#F9FAFB] border border-border rounded px-3 py-2 select-none cursor-pointer hover:bg-[#F0F4FF] transition-colors"
							>
								{scholarshipToDelete?.name}
							</p>
							<Input
								value={titleInput}
								onChange={(e) => setTitleInput(e.target.value)}
								placeholder="Type here"
								className="text-sm placeholder:text-[#9CA3AF]"
								autoFocus
							/>
						</div>
					</DialogHeader>
					<DialogFooter className="flex gap-3 mt-4">
						<button
							onClick={() => { setShowTitleModal(false); setTitleInput(""); }}
							disabled={loading}
							className="flex-1 px-4 py-2 cursor-pointer text-sm bg-tertiary border border-[#D1D5DB] text-[#374151] rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							onClick={confirmDelete}
							disabled={loading || titleInput !== scholarshipToDelete?.name}
							className="flex-1 px-4 py-2 cursor-pointer text-sm text-tertiary bg-[#EF4444] rounded-md transition-colors flex items-center justify-center gap-2 hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								"Delete"
							)}
						</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
