import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileError from "@/components/profile/ProfileError";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditHeader from "@/components/profile/EditHeader";
import IndividualSponsorProfileForm, {} from "@/components/sponsor/profile/IndividualProfileForm";
import OrganizationSponsorProfileForm, {} from "@/components/sponsor/profile/OrganizationProfileForm";
import GovernmentSponsorProfileForm, {} from "@/components/sponsor/profile/GovernmentProfileForm";
import { useAuth } from "@/auth";
import {
	SponsorType,
	type AnySponsor,
	type GovernmentSponsor,
	type IndividualSponsor,
	type OrganizationSponsor,
	type UpdateGovernmentSponsorRequest,
	type UpdateIndividualSponsorRequest,
	type UpdateOrganizationSponsorRequest,
} from "@/lib/sponsor/model";
import {
	getSponsorName,
	updateGovernmentSponsor,
	updateIndividualSponsor,
	updateOrganizationSponsor,
} from "@/lib/sponsor/api";
import { UserRole } from "@/lib/user/model";
import VerificationStatus from "@/components/verification/VerificationStatus";
import ProfileAvatar from "./-components/ProfileAvatar";

export const Route = createFileRoute("/_sponsor/profile/sponsor/$sponsorId/")({
	component: SponsorProfile,
});

function SponsorProfile() {

	const auth = useAuth<AnySponsor>();

	const isIndividual = auth.profile.sponsorType.code === SponsorType.Individual;
	const isOrganization =
		auth.profile.sponsorType.code === SponsorType.Organization;
	const isGovernment = auth.profile.sponsorType.code === SponsorType.Government;

	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const formRef = useRef<HTMLFormElement>(null);

	const individualSponsorMutation = useMutation({
		mutationFn: updateIndividualSponsor,
		onSuccess: async (res) => {
			setIsEditing(false);
			setIsSaving(false);
			auth.setProfile(res.data);
			toast.success(`Success`, "Profile updated successfully", 1250);
		},
		onError: (err: any) => {
			toast.error("Error", err.message || "Failed to update profile");
			console.error(err);
			setIsSaving(false);
		},
	});

	const organizationSponsorMutation = useMutation({
		mutationFn: updateOrganizationSponsor,
		onSuccess: async (res) => {
			setIsEditing(false);
			setIsSaving(false);
			console.log(res.data);
			auth.setProfile(res.data);
			toast.success(`Success`, "Profile updated successfully", 1250);
		},
		onError: (err: any) => {
			toast.error("Error", err.message || "Failed to update profile");
			console.error(err);
			setIsSaving(false);
		},
	});

	const governmentSponsorMutation = useMutation({
		mutationFn: updateGovernmentSponsor,
		onSuccess: async (res) => {
			setIsEditing(false);
			setIsSaving(false);
			auth.setProfile(res.data);
			toast.success(`Success`, "Profile updated successfully", 1250);
		},
		onError: (err: any) => {
			toast.error("Error", err.message || "Failed to update profile");
			console.error(err);
			setIsSaving(false);
		},
	});

	if (auth.isLoading) {
		return <ProfileSkeleton />;
	}

	if (auth.error) {
		return <ProfileError error={auth.error.message} />;
	}

	const handleEditClick = () => {
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
	};

	const handleSaveEdit = async () => {
		if (formRef.current) {
			formRef.current.dispatchEvent(
				new Event("submit", { bubbles: true, cancelable: true }),
			);
		}
	};

	const handleIndividualSponsorSubmit = async (
		data: UpdateIndividualSponsorRequest,
	) => {
		setIsSaving(true);
		individualSponsorMutation.mutate(data);
	};

	const handleOrganizationSponsorSubmit = async (
		data: UpdateOrganizationSponsorRequest,
	) => {
		setIsSaving(true);
		organizationSponsorMutation.mutate(data);
	};

	const handleGovernmentSponsorSubmit = async (
		data: UpdateGovernmentSponsorRequest,
	) => {
		setIsSaving(true);
		governmentSponsorMutation.mutate(data);
	};

	return (
		<div className="min-h-screen">
			<SEO title="Profile" noindex={true} />
			<div className="max-w-176 mx-auto space-y-6">
				{/* Profile Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className="bg-card rounded-lg shadow-sm border border-[#E0ECFF] overflow-hidden"
				>
					<div className="px-6 pb-6">
						<div className="flex flex-col md:flex-row items-center md:items-start gap-6 mt-6">
							<ProfileAvatar
								handleGovernmentSponsorSubmit={handleGovernmentSponsorSubmit}
								handleOrganizationSponsorSubmit={
									handleOrganizationSponsorSubmit
								}
								handleIndividualSponsorSubmit={handleIndividualSponsorSubmit}
							/>
							<ProfileHeader
								name={getSponsorName(auth.profile)}
								role={UserRole.Sponsor}
								email={auth.profile.email}
								contactNumber={auth.profile.contact.value}
							/>
						</div>
					</div>
				</motion.div>

				{import.meta.env.VITE_ENABLE_IDENTITY_VERIFICATION === "true" &&
					isIndividual && <VerificationStatus />}

				{/* Information Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
					className="bg-white rounded-lg shadow-sm border border-[#E0ECFF] p-6"
				>
					<EditHeader
						title={
							isIndividual
								? "Personal Information"
								: isOrganization
									? "Organization Information"
									: "Government Agency Information"
						}
						isEditing={isEditing}
						isSaving={isSaving}
						onEdit={handleEditClick}
						onCancel={handleCancelEdit}
						onSave={handleSaveEdit}
					/>

					{isIndividual && (
						<IndividualSponsorProfileForm
							ref={formRef}
							profile={auth.profile as IndividualSponsor}
							isEditing={isEditing}
							isSaving={isSaving}
							onSubmit={handleIndividualSponsorSubmit}
						/>
					)}

					{isOrganization && (
						<OrganizationSponsorProfileForm
							ref={formRef}
							profile={auth.profile as OrganizationSponsor}
							isEditing={isEditing}
							isSaving={isSaving}
							onSubmit={handleOrganizationSponsorSubmit}
						/>
					)}

					{isGovernment && (
						<GovernmentSponsorProfileForm
							ref={formRef}
							profile={auth.profile as GovernmentSponsor}
							isEditing={isEditing}
							isSaving={isSaving}
							onSubmit={handleGovernmentSponsorSubmit}
						/>
					)}
				</motion.div>
			</div>
		</div>
	);
}

