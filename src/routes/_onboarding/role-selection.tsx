import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
	HiAcademicCap,
	HiArrowLeft,
	HiBuildingLibrary,
	HiBuildingOffice2,
	HiHeart,
	HiUser,
	HiUserGroup,
} from "react-icons/hi2";
import { z } from "zod";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { SEO } from "@/components/SEO";
import { toast } from "@/lib/toast";
import { SponsorType } from "@/lib/sponsor/model";
import { UserRole } from "@/lib/user/model";
import { cn } from "@/lib/utils";
// import { profileService } from '@/services/profile.service';

export const Route = createFileRoute("/_onboarding/role-selection")({
	component: RoleSelection,
});

const roleSchema = z.enum(UserRole, { message: "Please select a role" });
const sponsorTypeSchema = z.enum(SponsorType, {
	message: "Please select a sub-role",
});

function RoleSelection() {
	const navigate = useNavigate();

	const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
	const [selectedSponsorType, setSponsorType] = useState<SponsorType | null>(
		null,
	);
	const [showSponsorTypes, setShowSponsorTypes] = useState(false);

	const [loading, setLoading] = useState(false);
	const roles = [
		{
			id: "student",
			title: "iStudent",
			value: "student",
			subtitle: "Scholarship seeker",
			description:
				"Apply for scholarships, upload your academic credentials, and receive financial support for your education journey.",
			icon: HiAcademicCap,
			color: "border-[#EFA508]",
			iconColor: "text-[#EFA508]",
			titleColor: "text-[#EFA508]",
			subtitleColor: "text-[#EFA508]",
			bgColor: "bg-background",
		},
		{
			id: "sponsor",
			title: "iSponsor",
			value: "sponsor",
			subtitle: "Scholarship Provider",
			description:
				"Create scholarship programs, support deserving students, and make a positive impact on education.",
			icon: HiHeart,
			color: "border-success",
			iconColor: "text-success",
			titleColor: "text-success",
			subtitleColor: "text-success",
			bgColor: "bg-background",
		},
		{
			id: "school",
			title: "iSchool",
			value: "school",
			subtitle: "Verifier",
			description:
				"Verify student's credential, receive scholarship funds, facilitate educational partnerships",
			icon: HiBuildingOffice2,
			color: "border-[#607EF2]",
			iconColor: "text-[#607EF2]",
			titleColor: "text-[#607EF2]",
			subtitleColor: "text-[#607EF2]",
			bgColor: "bg-background",
		},
	];

	const sponsorSubRoles = [
		{
			id: SponsorType.Individual,
			title: "Individual",
			subtitle: "Independent Sponsor",
			description:
				"Personally support deserving students by funding their studies and helping them achieve academic success.",
			icon: HiUser,
			color: "border-success",
			selectedBgColor: "bg-success",
			iconColor: "text-success",
			titleColor: "text-success",
			subtitleColor: "text-success",
			bgColor: "bg-background",
		},
		{
			id: SponsorType.Organization,
			title: "Organization",
			subtitle: "Scholarship Organization",
			description:
				"Provide scholarships as an institution, foundation, or non-profit to empower students and strengthen educational opportunities.",
			icon: HiUserGroup,
			color: "border-success",
			selectedBgColor: "bg-success",
			iconColor: "text-success",
			titleColor: "text-success",
			subtitleColor: "text-success",
			bgColor: "bg-background",
		},
		{
			id: SponsorType.Government,
			title: "Government",
			subtitle: "Government Agency",
			description:
				"Offer government-funded scholarships to promote equal access to education and invest in the nation's future workforce.",
			icon: HiBuildingLibrary,
			color: "border-success",
			selectedBgColor: "bg-success",
			iconColor: "text-success",
			titleColor: "text-success",
			subtitleColor: "text-success",
			bgColor: "bg-background",
		},
	];

	const handleRoleSelect = (role: UserRole) => {
		if (role === UserRole.School) {
			toast.error("Unavailable", "The school role is not available yet.");
			return;
		}
		if (role === UserRole.Sponsor) {
			setSelectedRole(role);
			setShowSponsorTypes(true);
			return;
		}

		setSelectedRole(role);
		setShowSponsorTypes(false);
		setSponsorType(null);
	};

	const handleBack = () => {
		setShowSponsorTypes(false);
		setSelectedRole(null);
		setSponsorType(null);
	};

	const validateSelection = (): { isValid: boolean; errorMessage?: string } => {
		if (!selectedRole) {
			return { isValid: false, errorMessage: "Please select a role" };
		}

		try {
			if (selectedRole === UserRole.Sponsor) {
				if (!selectedSponsorType) {
					return { isValid: false, errorMessage: "Please select a sub-role" };
				}
				sponsorTypeSchema.parse(selectedSponsorType);
			} else {
				roleSchema.parse(selectedRole);
			}
			return { isValid: true };
		} catch (error) {
			if (error instanceof z.ZodError) {
				return { isValid: false, errorMessage: error.issues[0].message };
			}
			return { isValid: false, errorMessage: "Invalid selection" };
		}
	};

	const handleSelect = async () => {
		setLoading(true);

		const validation = validateSelection();

		if (!validation.isValid) {
			toast.error(`Validation Error`, "Please make a valid selection", 2500);
			return;
		}

		let roleMessage = "";

		if (selectedRole === UserRole.Student) {
			roleMessage = "You selected the Student role.";
		} else if (selectedRole === UserRole.Sponsor) {
			if (selectedSponsorType === SponsorType.Individual) {
				roleMessage = "You selected the Individual Sponsor role.";
			} else if (selectedSponsorType === SponsorType.Organization) {
				roleMessage = "You selected the Organization Sponsor role.";
			} else if (selectedSponsorType === SponsorType.Government) {
				roleMessage = "You selected the Government Agency role.";
			} else {
				return;
			}
		} else if (selectedRole === "school") {
			roleMessage = "You selected the School role.";
		} else {
			return;
		}

		setLoading(false);

		toast.success(`Success`, roleMessage, 1250);

		if (selectedRole === UserRole.Student) {
			navigate({ to: "/profile-setup/student" });
		} else if (selectedRole === UserRole.Sponsor) {
			if (selectedSponsorType === SponsorType.Individual) {
				navigate({ to: "/profile-setup/individual-sponsor" });
			} else if (selectedSponsorType === SponsorType.Organization) {
				navigate({ to: "/profile-setup/organization-sponsor" });
			} else if (selectedSponsorType === SponsorType.Government) {
				navigate({ to: "/profile-setup/government-sponsor" });
			}
		} else if (selectedRole === UserRole.School) {
			navigate({ to: "/profile-setup/school" });
		}
	};

	const canContinue =
		selectedRole && (selectedRole !== "sponsor" || selectedSponsorType);

	return (
		<>
			<SEO title="Role Selection" noindex={true} />
			<FeedbackWidget />

			<div className="fade-in text-center py-8 sm:py-10 md:py-12 relative">
				{/* Title and Subtitle */}
				<div
					className="fade-in-down mb-8 sm:mb-10 md:mb-12 max-w-4xl mx-auto"
					style={{ animationDelay: "0.1s" }}
				>
					<div className="grid grid-cols-[1.25rem_1fr_1.25rem] sm:grid-cols-[1.5rem_1fr_1.5rem] items-center mb-1 sm:mb-2">
						{showSponsorTypes ? (
							<button
								type="button"
								onClick={handleBack}
								className="flex items-center text-secondary hover:text-[#2A4296] transition-colors duration-300 group active:scale-95"
							>
								<HiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:-translate-x-1" />
							</button>
						) : (
							<span />
						)}
						<h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl text-secondary text-center">
							Welcome to iSkolar
						</h1>
						<span />
					</div>
					<p className="text-base sm:text-lg md:text-xl text-secondary">
						{showSponsorTypes ? "Select your sub-role" : "Select your role"}
					</p>
				</div>

				<section>
					{!showSponsorTypes ? (
						/* Main Role Selection */
						<div
							key="main-roles"
							className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12"
						>
							{roles.map((role, index) => {
								const IconComponent = role.icon;
								return (
									<button
										key={role.id}
										onClick={() => handleRoleSelect(role.id as UserRole)}
										className={cn(
											selectedRole === role.id
												? role.color.replace("border-", "bg-")
												: role.bgColor,
											role.color,
											"border-4 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 transition-all duration-500 hover:shadow-xl",
											selectedRole === role.id
												? "shadow-2xl scale-105"
												: "shadow-lg",
											"cursor-pointer",
											"role-card hover:scale-105 active:scale-95",
										)}
										style={{ animationDelay: `${0.1 + index * 0.15}s` }}
									>
										{/* Icon */}
										<div
											className={`${selectedRole === role.id ? "text-tertiary" : role.iconColor} mb-3 sm:mb-4 flex justify-center transition-colors duration-500`}
										>
											<IconComponent className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
										</div>

										{/* Title */}
										<h2
											className={`text-xl sm:text-1xl md:text-3xl ${selectedRole === role.id ? "text-tertiary" : role.titleColor} mb-1 transition-colors duration-500`}
										>
											{role.title}
										</h2>

										{/* Subtitle */}
										<p
											className={`text-xs sm:text-sm md:text-base ${selectedRole === role.id ? "text-tertiary" : role.subtitleColor} mb-4 sm:mb-6 md:mb-8 transition-colors duration-500`}
										>
											{role.subtitle}
										</p>

										{/* Description */}
										<p
											className={`text-left text-xs sm:text-sm md:text-md ${selectedRole === role.id ? "text-tertiary" : "text-gray-800"} leading-relaxed transition-colors duration-500`}
										>
											{role.description}
										</p>
									</button>
								);
							})}
						</div>
					) : (
						/* Sponsor Sub-Role Selection */
						<div
							key="sponsor-roles"
							className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12"
						>
							{sponsorSubRoles.map((subRole, index) => {
								const IconComponent = subRole.icon;
								return (
									<button
										key={subRole.id}
										onClick={() => setSponsorType(subRole.id)}
										className={cn(
											selectedSponsorType === subRole.id
												? subRole.selectedBgColor
												: subRole.bgColor,
											subRole.color,
											`border-4 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 transition-all duration-500 hover:shadow-xl `,
											selectedSponsorType === subRole.id
												? "shadow-2xl scale-105"
												: "shadow-lg",
											"cursor-pointer",
											"role-card hover:scale-105 active:scale-95",
										)}
										style={{ animationDelay: `${0.1 + index * 0.15}s` }}
									>
										{/* Icon */}
										<div
											className={`${selectedSponsorType === subRole.id ? "text-tertiary" : subRole.iconColor} mb-3 sm:mb-4 flex justify-center transition-colors duration-500`}
										>
											<IconComponent className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
										</div>

										{/* Title */}
										<h2
											className={`text-xl sm:text-1xl md:text-3xl ${selectedSponsorType === subRole.id ? "text-tertiary" : subRole.titleColor} mb-1 transition-colors duration-500`}
										>
											{subRole.title}
										</h2>

										{/* Subtitle */}
										<p
											className={`text-xs sm:text-sm md:text-base ${selectedSponsorType === subRole.id ? "text-tertiary" : subRole.subtitleColor} mb-4 sm:mb-6 md:mb-8 transition-colors duration-500`}
										>
											{subRole.subtitle}
										</p>

										{/* Description */}
										<p
											className={`text-left text-xs sm:text-sm md:text-md ${selectedSponsorType === subRole.id ? "text-tertiary" : "text-gray-800"} leading-relaxed transition-colors duration-500`}
										>
											{subRole.description}
										</p>
									</button>
								);
							})}
						</div>
					)}
				</section>

				{/* Select Button */}
				<div
					className="fade-in-up flex justify-center gap-4"
					style={{ animationDelay: "0.6s" }}
				>
					<button
						type="button"
						onClick={handleSelect}
						disabled={!canContinue || loading}
						className={`px-38 sm:px-40 md:px-22 lg:px-29 py-3 sm:py-3.5 md:py-3 rounded-lg text-sm sm:text-base md:text-base transition-all duration-300 ${
							canContinue && !loading
								? "bg-[#EFA508] hover:bg-[#D89407] text-tertiary cursor-pointer shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
								: "bg-[#9CA3AF] text-tertiary cursor-not-allowed"
						}`}
					>
						{loading ? (
							<span className="flex items-center justify-center">
								<Loader2 className="w-4 h-4 animate-spin" />
							</span>
						) : (
							<span>Select</span>
						)}
					</button>
				</div>
			</div>
		</>
	);
}
