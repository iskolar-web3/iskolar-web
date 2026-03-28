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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FilterSelect from "@/components/sponsor/scholarships/Filters";
import ScholarshipCard from "@/components/sponsor/scholarships/ScholarshipCard";
import ScholarshipCardSkeleton from "@/components/ScholarshipCardSkeleton";
import ScholarshipDetailsModal from "@/components/sponsor/scholarships/ScholarshipDetailsDrawer";
import { SEO } from "@/components/SEO";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import {
	deleteScholarship,
	getMyScholarshipsQuery,
} from "@/lib/scholarship/api";
import { useAuth } from "@/auth";
import type { AnySponsor } from "@/lib/sponsor/model";
import {
	getScholarshipQueryParamSchema,
	type Scholarship,
} from "@/lib/scholarship/model";

export const Route = createFileRoute("/_sponsor/scholarships")({
	component: Scholarships,
	validateSearch: getScholarshipQueryParamSchema,
});

function Scholarships() {

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [sortBy, setSortBy] = useState("Newest");
	const [scholarshipType, setScholarshipType] = useState("All");
	const [purpose, setPurpose] = useState("All");
	const [applicationsRange, setApplicationsRange] = useState({
		min: "",
		max: "",
	});
	const [amountRange, setAmountRange] = useState({ min: "", max: "" });
	const [slotRange, setSlotRange] = useState({ min: "", max: "" });
	const [selectedScholarship, setSelectedScholarship] =
		useState<Scholarship | null>(null);
	const [showFiltersModal, setShowFiltersModal] = useState(false);

	// const { data: scholarships = [], isLoading: loading, error, isError } = useSponsorScholarships();

	const search = useSearch({ from: "/_sponsor/scholarships" });

	const auth = useAuth<AnySponsor>();
	const scholarships = useSuspenseQuery(
		getMyScholarshipsQuery(auth.sessionToken, {
			...search,
			sponsorId: auth.profile.id,
		}),
	);

	const { toast, showSuccess, showError } = useToast();

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

	const deleteMutation = useMutation({
		mutationFn: deleteScholarship,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["scholarships"] });
			showSuccess("Success", "Scholarship deleted successfully", 2000);
		},
		onError: (err) => {
			showError("Error", err.message);
			console.error(err);
		},
	});

	function confirmDelete(): void {
		if (!selectedScholarship) return;

		deleteMutation.mutate(selectedScholarship.id);
		setSelectedScholarship(null);
	}

	useEffect(() => {
		if (scholarships.isError) {
			showError("Error", scholarships.error.message, 2500);
		}
	}, [scholarships.isError, scholarships.error, showError]);

	const filteredScholarships = useMemo(() => {
		return scholarships.data.filter((scholarship) => {
			const matchesType =
				scholarshipType === "All" ||
				scholarship.scholarshipType.code === scholarshipType.toLowerCase();

			const matchesPurpose =
				purpose === "All" ||
				scholarship.purpose.code.toLowerCase() === purpose.toLowerCase();

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
				(!slotRange.min || scholarship.totalSlots >= Number(slotRange.min)) &&
				(!slotRange.max || scholarship.totalSlots <= Number(slotRange.max));

			return (
				matchesType &&
				matchesPurpose &&
				matchesApplications &&
				matchesAmount &&
				matchesSlots
			);
		});
	}, [
		scholarships,
		scholarshipType,
		purpose,
		applicationsRange,
		amountRange,
		slotRange,
	]);

	return (
		<div className="min-h-screen">
			<SEO title="My Scholarships" noindex={true} />
			{toast && <Toast {...toast} />}

			{/* Mobile/Tablet Layout */}
			<div className="lg:hidden space-y-2">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="bg-card rounded-md text-center p-2 border border-[#D3DCF6] shadow-sm"
				>
					<p className="text-base text-primary tracking-wide">
						My Scholarships
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
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

								<FilterSelect
									title="Scholarship Purpose"
									options={["All", "Allowance", "Tuition"]}
									value={purpose}
									onChange={setPurpose}
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
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4 }}
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

									<FilterSelect
										title="Scholarship Purpose"
										options={["All", "Allowance", "Tuition"]}
										value={purpose}
										onChange={setPurpose}
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
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
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
									<button
										onClick={() => navigate({ to: "/create" })}
										className="inline-flex items-center cursor-pointer gap-2 px-4 py-2.5 bg-[#9CA3AF] text-tertiary text-sm md:text-base rounded-md hover:bg-muted-foreground hover:text-tertiary transition-colors"
									>
										<Plus size={18} />
										Create Scholarship
									</button>
								</div>
							) : (
								filteredScholarships.map((scholarship, index) => (
									<ScholarshipCard
										key={scholarship.id}
										scholarship={scholarship}
										index={index}
										onClick={() => setSelectedScholarship(scholarship)}
										onEdit={handleEdit}
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
					onDelete={confirmDelete}
					onViewApplicants={handleViewApplicants}
				/>
			)}
		</div>
	);
}
