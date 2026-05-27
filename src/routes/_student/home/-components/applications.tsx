import { type Dispatch, type ElementType, type JSX, type SetStateAction, useState } from "react";
import {
	Calendar,
	Users,
	Coins,
	UserIcon,
	Clock,
	CheckCircle,
	XCircle,
	Award,
	FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { statusStyles } from "@/components/student/home/ApplicationDetailsDrawer";
import {
	formatDate,
	formatTime,
	formatCurrency,
} from "@/utils/formatting.utils";
import {
	type Application,
	ScholarshipType,
} from "@/lib/scholarship/model";
import { getSponsorName } from "@/lib/sponsor/api";
import { isLightColor } from "@/routes/_sponsor/create/-components/fields/CardColorPicker";
import { format } from "date-fns";
import SubmittedFormsModal from "@/components/student/home/SubmittedFormsModal";

type Props = {
	applications: Application[];
	setSelectedApplication: Dispatch<SetStateAction<Application | null>>;
};

export function HomeApplications(props: Props): JSX.Element {
	const [formsModalApplication, setFormsModalApplication] = useState<Application | null>(null);

	return (
		<>
			<section>
				{props.applications.map((item, index) => {
					const cardColor = item.scholarship.cardColor ?? "#3A52A6";
					const isLight = isLightColor(cardColor);
					const headerTextColor = isLight ? "#111827" : "#F9FAFB";
					return (
					<div key={item.application.id} className="flex gap-4 md:gap-6">
						{/* Desktop: Date/Time */}
						<div className="hidden md:flex gap-4">
							<div className="flex flex-col items-start w-30 shrink-0 pt-1">
								<div className="text-left">
									<div className="text-sm text-primary">
										{formatDate(item.application.createdAt)}
									</div>
									<div className="text-xs text-[#6B7280]">
										{formatDate(item.application.createdAt)}
									</div>
								</div>
							</div>

							{/* Timeline dot and line */}
							<div className="relative flex flex-col items-center pt-1">
								<div className="w-3 h-3 rounded-full mr-px bg-[#3A52A6] shadow-[0_0_0_4px_rgba(63,81,181,0.22)] z-10" />
								<div
									className={`w-px flex-1 border-l border-dashed border-[#3A52A6]/60 ${
										index === props.applications.length - 1 ? "opacity-70" : ""
									}`}
								/>
							</div>
						</div>

						{/* Mobile/Tablet */}
						<div className="md:hidden relative flex flex-col items-center pt-1">
							<div className="w-3 h-3 rounded-full bg-[#3A52A6] shadow-[0_0_0_4px_rgba(63,81,181,0.22)] z-10" />
							<div
								className={`mt-1 w-px flex-1 border-l border-dashed border-[#3A52A6]/60 ${
									index === props.applications.length - 1 ? "opacity-70" : ""
								}`}
							/>
						</div>

						{/* Card column */}
						<div className="flex-1 mb-3">
							{/* Mobile/Tablet: Date/Time */}
							<div className="md:hidden mb-2 text-left">
								<div className="text-xs text-primary">
									{formatDate(item.application.createdAt)}
								</div>
								<div className="text-[11px] text-[#6B7280]">
									{formatTime(item.application.createdAt)}
								</div>
							</div>

							<div
								role="button"
								tabIndex={0}
								onClick={() => props.setSelectedApplication(item)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										props.setSelectedApplication(item);
									}
								}}
								className="w-full text-left cursor-pointer"
							>
								<motion.div
									initial={{ opacity: 0, y: 18 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
									whileHover={{
										scale: 0.99,
										transition: { duration: 0.2 },
									}}
									className="overflow-hidden rounded-lg bg-white hover:border-[#3A52A6] shadow-sm border border-[#E0ECFF] hover:shadow-md transition-colors"
								>
									{/* Header */}
									<div className="flex" style={{ backgroundColor: cardColor }}>
										<div className="relative w-32 h-32 shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${cardColor} 70%, black)` }}>
											<img
												src={item.scholarship.imageUrl || "/scholarship-banner-placeholder.png"}
												alt={item.scholarship.name}
												className="h-full w-full object-cover"
											/>
										</div>

										<div className="flex-1 px-3 py-2" style={{ color: headerTextColor }}>
											<div className="flex items-start justify-between gap-2">
												<div className="space-y-1 flex-1 min-w-0">
													<h3 className="text-lg md:text-xl line-clamp-1 pr-2">
														{item.scholarship.name}
													</h3>

													<div className="flex flex-wrap gap-1 mb-3">
														{item.scholarship.scholarshipType.code === ScholarshipType.Combined ? (
															<>
																<span className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded whitespace-nowrap">
																	Merit-Based
																</span>
																<span className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded whitespace-nowrap">
																	Need-Based
																</span>
															</>
														) : (
															<span className="px-2 py-0.5 bg-white/90 text-secondary text-[10px] md:text-[11px] rounded whitespace-nowrap">
																{item.scholarship.scholarshipType.name}
															</span>
														)}
													</div>

													<div className="space-y-1.5 text-xs">
														<div className="flex items-center gap-2">
															<div className="w-4 h-4 rounded-full bg-card flex items-center justify-center shrink-0">
																{item.scholarship?.sponsor?.avatarUrl ? (
																	<img
																		src={item.scholarship?.sponsor?.avatarUrl}
																		alt={getSponsorName(item.scholarship.sponsor)}
																		className="w-full h-full rounded-full object-cover"
																	/>
																) : (
																	<UserIcon className="w-full h-full text-secondary" />
																)}
															</div>
															<span className="truncate">
																{getSponsorName(item.scholarship.sponsor)}
															</span>
														</div>
														<div className="flex items-center gap-2">
															<Calendar size={16} className="shrink-0" />
															<span className="truncate">
																{format(
																	item.scholarship.applicationDeadline,
																	"MMM. d, yyyy",
																)}
															</span>
														</div>
													</div>
												</div>

												<div className="flex flex-col items-end gap-1 mt-1 shrink-0">
													<div
														className={`${
															{
																pending: "text-[#FCD34D]",
																shortlisted: "text-[#FDBA74]",
																approved: "text-[#6EE7B7]",
																denied: "text-[#EF4444]",
																granted: "text-[#C7D2FE]",
																withdrawn: "text-[#9CA3AF]",
															}[item.application.status.code]
														}`}
														title={
															statusStyles[item.application.status.code]?.label
														}
													>
														{(() => {
															const statusIcons: Record<string, ElementType> = {
																pending: Clock,
																shortlisted: FileText,
																approved: CheckCircle,
																denied: XCircle,
																granted: Award,
															};
															const Icon = statusIcons[item.application.status.code];
															return Icon ? <Icon size={20} /> : null;
														})()}
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Body */}
									<div className="p-4 space-y-2">
										<div className="grid grid-cols-2 gap-2">
											<div className="rounded-lg border border-border bg-[#F9FAFB] p-3">
												<div className="mb-1 flex items-center gap-1.5 text-xs text-[#6B7280]">
													<Coins size={16} />
													<span>Amount</span>
												</div>
												{(() => {
													const s = item.scholarship;
													const isRange = s.totalAmountMin != null || s.totalAmountMax != null;
													const isFixed = !isRange && s.totalAmount != null;
													if (isFixed) return (<><p className="text-sm text-primary">{formatCurrency(s.totalAmount!, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p><p className="text-xs text-[#6B7280]">per scholar</p></>);
													if (isRange) return (<><p className="text-sm text-primary">{formatCurrency(s.totalAmountMin ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{" – "}{formatCurrency(s.totalAmountMax ?? 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p><p className="text-xs text-[#6B7280]">per scholar</p></>);
													return (<><p className="text-sm text-primary">Varies</p><p className="text-xs text-[#6B7280]">see details</p></>);
												})()}
											</div>

											<div className="rounded-lg border border-border bg-[#F9FAFB] p-3">
												<div className="mb-1 flex items-center gap-1.5 text-xs text-[#6B7280]">
													<Users size={16} />
													<span>Slots</span>
												</div>
												<p className="text-sm text-primary">
													{item.scholarship.totalSlots ?? "No limit"}
												</p>
												<p className="text-xs text-[#6B7280]">scholars</p>
											</div>
										</div>

										<div className="flex gap-2">
											<button
												onClick={(e) => {
													e.stopPropagation();
													props.setSelectedApplication(item);
												}}
												className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-border bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors"
											>
												View Details
											</button>

											{item.scholarship.formFields.length > 0 && (
												<button
													onClick={(e) => {
														e.stopPropagation();
														setFormsModalApplication(item);
													}}
													className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-border bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors"
												>
													View Submitted Form
												</button>
											)}
										</div>
									</div>
								</motion.div>
							</div>

						</div>
					</div>
				);})}
			</section>

			{formsModalApplication && (
				<SubmittedFormsModal
					application={formsModalApplication}
					onClose={() => setFormsModalApplication(null)}
				/>
			)}
		</>
	);
}
