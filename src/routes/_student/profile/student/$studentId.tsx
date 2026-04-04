import { createFileRoute } from "@tanstack/react-router";
import { User, Edit, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileError from "@/components/profile/ProfileError";
import ProfileHeader from "@/components/profile/ProfileHeader";
import EditHeader from "@/components/profile/EditHeader";
import LumenUploadModal from "@/components/student/profile/credentials/LumenUploadModal";
import LumenFilesList from "@/components/student/profile/credentials/LumenFilesList";
import { useAuth } from "@/auth";
import type { Student, UpdateStudentRequest } from "@/lib/student/model";
import { UserRole } from "@/lib/user/model";
import { updateStudent } from "@/lib/student/api";
import { useMutation } from "@tanstack/react-query";
import StudentProfileForm from "@/components/student/profile/ProfileForm";
import { uploadFile } from "@/lib/api";
import { ACCESS_TOKEN_KEY } from "@/lib/user/auth";
import { getCookie } from "@/lib/cookie";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_student/profile/student/$studentId")({
	component: StudentProfilePage,
});

function StudentProfilePage() {

	const auth = useAuth<Student>();
	const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [credentialRefreshKey, setCredentialRefreshKey] = useState(0);

	const formRef = useRef<HTMLFormElement>(null);
	const { toast, showSuccess, showError } = useToast();

	const mutation = useMutation({
		mutationFn: updateStudent,
		onSuccess: async (res) => {
			auth.setProfile(res.data);
			// @ts-expect-error this works
			auth.setUser((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
			setIsEditing(false);
			setIsSaving(false);
			showSuccess(`Success`, res.message, 1250);
		},
		onError: (err) => {
			showError("Error", err.message);
			console.error(err);
			setIsSaving(false);
		},
	});

	if (auth.isLoading) {
		return <ProfileSkeleton />;
	}

	if (auth.error) {
		return (
			<ProfileError error={auth.error.message || "Failed to load profile"} />
		);
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

	const handleFormSubmit = async (data: UpdateStudentRequest) => {
		setIsSaving(true);
		mutation.mutate(data);
	};

	const handleCredentialSuccess = () => {
		setCredentialRefreshKey((k) => k + 1);
		showSuccess("Success", "Your credential has been saved.", 2500);
	};

	return (
		<div className="min-h-screen">
			<SEO title="Profile" noindex={true} />
			{toast && <Toast {...toast} />}

			{/* Credential Upload Modal - Feature Flag */}
			{import.meta.env.VITE_ENABLE_LUMEN_CREDENTIALS === "true" && (
				<LumenUploadModal
					isOpen={isCredentialModalOpen}
					onClose={() => setIsCredentialModalOpen(false)}
					onSuccess={handleCredentialSuccess}
					userId={auth.profile.id}
				/>
			)}

			<div className="max-w-2xl mx-auto space-y-4">
				{/* Profile Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className="bg-card rounded-lg shadow-sm border border-[#E0ECFF] overflow-hidden"
				>
					<div className="px-6 pb-6">
						<div className="flex flex-col md:flex-row items-center md:items-start gap-6 mt-6">
							<ProfileAvatar onSubmit={handleFormSubmit} />
							<ProfileHeader
								name={`${auth.profile.firstName} ${auth.profile.lastName}`}
								role={UserRole.Student}
								email={auth.profile.email}
								contactNumber={auth.profile.contact.value}
							/>
						</div>
					</div>
				</motion.div>

				{/* Personal Information */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
					className="bg-white rounded-lg shadow-sm border border-[#E0ECFF] p-6"
				>
					<EditHeader
						title="Personal Information"
						isEditing={isEditing}
						isSaving={isSaving}
						onEdit={handleEditClick}
						onCancel={handleCancelEdit}
						onSave={handleSaveEdit}
					/>

					<StudentProfileForm
						ref={formRef}
						profile={auth.profile}
						isEditing={isEditing}
						isSaving={isSaving}
						onSubmit={handleFormSubmit}
					/>
				</motion.div>

				{/* Credentials - Feature Flag */}
				{import.meta.env.VITE_ENABLE_LUMEN_CREDENTIALS === "true" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.3 }}
						className="bg-white rounded-lg shadow-sm border border-[#E0ECFF] p-6"
					>
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-2">
								<h2 className="text-lg text-primary">Credentials</h2>
							</div>
							<button
								onClick={() => setIsCredentialModalOpen(true)}
								className="px-3 py-2 cursor-pointer bg-[#3B5AA8] hover:bg-[#2f4389] text-white text-xs font-medium rounded-sm transition-colors flex items-center gap-2"
							>
								<Plus className="w-3.5 h-3.5" />
								Add Credential
							</button>
						</div>

						<LumenFilesList userId={auth.profile.id} refreshKey={credentialRefreshKey} />
					</motion.div>
				)}
			</div>
		</div>
	);
}

type ProfileAvatarProps = {
	onSubmit: (data: UpdateStudentRequest) => Promise<void>;
};

function ProfileAvatar(props: ProfileAvatarProps) {
	const auth = useAuth<Student>();
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
		await props.onSubmit({
			id: auth.profile.id,
			userId: auth.user?.id,
			avatarUrl: uploadRes.data.url,
		});
		console.log("New avatar image upload:", uploadRes);
	}

	function handleClick(): void {
		fileInputRef.current?.click();
	}

	return (
		<div className="relative">
			<div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white p-1 shadow-lg">
				<Avatar className="size-full">
					<AvatarImage src={auth.profile?.avatarUrl || ""} />
					<AvatarFallback>
						<User className="w-12 h-12 md:w-14 md:h-14 text-[#6B7280]" />
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
