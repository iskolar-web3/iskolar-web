import { createFileRoute } from "@tanstack/react-router";
import { User, Building2, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { useMutation } from "@tanstack/react-query";
import Toast from "@/components/Toast";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCookie } from "@/lib/cookie";
import { ACCESS_TOKEN_KEY } from "@/lib/user/auth";
import { uploadFile } from "@/lib/api";

export const Route = createFileRoute("/_sponsor/profile/sponsor/$sponsorId")({
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
	const { toast, showSuccess, showError } = useToast();

	const individualSponsorMutation = useMutation({
		mutationFn: updateIndividualSponsor,
		onSuccess: async (res) => {
			setIsEditing(false);
			setIsSaving(false);
			auth.setProfile(res.data);
			showSuccess(`Success`, "Profile updated successfully", 1250);
		},
		onError: (err: any) => {
			showError("Error", err.message || "Failed to update profile");
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
			showSuccess(`Success`, "Profile updated successfully", 1250);
		},
		onError: (err: any) => {
			showError("Error", err.message || "Failed to update profile");
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
			showSuccess(`Success`, "Profile updated successfully", 1250);
		},
		onError: (err: any) => {
			showError("Error", err.message || "Failed to update profile");
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
			{toast && <Toast {...toast} />}
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

type ProfileAvatarProps = {
	handleIndividualSponsorSubmit: (
		data: UpdateIndividualSponsorRequest,
	) => Promise<void>;
	handleOrganizationSponsorSubmit: (
		data: UpdateOrganizationSponsorRequest,
	) => Promise<void>;
	handleGovernmentSponsorSubmit: (
		data: UpdateGovernmentSponsorRequest,
	) => Promise<void>;
};

function ProfileAvatar(props: ProfileAvatarProps) {
	const auth = useAuth<AnySponsor>();
	const fileInputRef = useRef<HTMLInputElement>(null);

	async function handleImageUpload(
		e: React.ChangeEvent<HTMLInputElement>,
	): Promise<void> {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		const token = getCookie(ACCESS_TOKEN_KEY);
		if (!token) {
			return;
		}

		const uploadRes = await uploadFile(file, token, "profile-images");

		switch (auth.profile.sponsorType.code) {
			case SponsorType.Individual:
				await props.handleIndividualSponsorSubmit({
					id: auth.profile.id,
					userId: auth.user?.id,
					avatarUrl: uploadRes.data.url,
				});
				break;

			case SponsorType.Organization:
				await props.handleOrganizationSponsorSubmit({
					id: auth.profile.id,
					userId: auth.user?.id,
					avatarUrl: uploadRes.data.url,
				});
				break;

			case SponsorType.Government:
				await props.handleGovernmentSponsorSubmit({
					id: auth.profile.id,
					userId: auth.user?.id,
					avatarUrl: uploadRes.data.url,
				});
				break;
		}

		console.log("New avatar image upload:", uploadRes);
        // @ts-expect-error this works
		auth.setUser((prev) => ({ ...prev, avatarUrl: uploadRes.data.url }));
	}

	function handleClick(): void {
		fileInputRef.current?.click();
	}

	return (
		<div className="relative">
			<div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white p-1 shadow-lg">
				<Avatar className="size-full">
					<AvatarImage src={auth.user?.avatarUrl || ""} />
					<AvatarFallback>
						{auth.profile.sponsorType.code === SponsorType.Individual ? (
							<User className="w-12 h-12 md:w-14 md:h-14 text-[#6B7280]" />
						) : (
							<Building2 className="w-12 h-12 md:w-14 md:h-14 text-[#6B7280]" />
						)}
					</AvatarFallback>
				</Avatar>
			</div>
			<button
				className="absolute bottom-0 right-0 w-8 h-8 bg-secondary hover:bg-[#2f4389] rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer"
				title="Edit profile picture"
				aria-label="Edit profile picture"
				onClick={handleClick}
			>
				<Edit className="w-4 h-4 text-tertiary" />

				<input
					type="file"
					accept="image/*"
					onChange={handleImageUpload}
					className="hidden"
					ref={fileInputRef}
				/>
			</button>
		</div>
	);
}
