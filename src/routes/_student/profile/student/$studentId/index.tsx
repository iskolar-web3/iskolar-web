import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShieldCheck, ShieldAlert } from "lucide-react";
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
import VerificationStatus from "@/components/verification/VerificationStatus";
import ProfileAvatar from "./-components/ProfileAvatar";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { VerificationStatus as VerStatus } from "@/lib/verification/model";

export const Route = createFileRoute("/_student/profile/student/$studentId/")({
	component: StudentProfilePage,
});

function StudentProfilePage() {

	const auth = useAuth<Student>();
	const verificationEnabled = import.meta.env.VITE_ENABLE_IDENTITY_VERIFICATION === "true";
	const verificationQuery = useVerificationStatus("students", verificationEnabled);
	const isVerified = verificationQuery.isLoading || verificationQuery.data?.status === VerStatus.Verified;

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
		)
	}

	const handleEditClick = () => {
		setIsEditing(true);
	}

	const handleCancelEdit = () => {
		setIsEditing(false);
	}

	const handleSaveEdit = async () => {
		if (formRef.current) {
			formRef.current.dispatchEvent(
				new Event("submit", { bubbles: true, cancelable: true }),
			)
		}
	}

	const handleFormSubmit = async (data: UpdateStudentRequest) => {
		setIsSaving(true);
		mutation.mutate(data);
	}

	const handleCredentialSuccess = () => {
		setCredentialRefreshKey((k) => k + 1);
		showSuccess("Success", "Your credential has been saved.", 2500);
	}

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
						<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mt-6">
							<div className="flex flex-col md:flex-row items-center md:items-start gap-6">
								<ProfileAvatar onSubmit={handleFormSubmit} />
								<ProfileHeader
									name={`${auth.profile.firstName} ${auth.profile.lastName}`}
									role={UserRole.Student}
									email={auth.profile.email}
									contactNumber={auth.profile.contact.value}
								/>
							</div>
							{verificationEnabled && !verificationQuery.isLoading && (
								<div className="flex justify-center md:justify-end shrink-0 md:mt-6">
									{isVerified ? (
										<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md text-green-700 text-xs font-medium">
											<ShieldCheck className="w-3.5 h-3.5" />
											Verified
										</span>
									) : (
										<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs font-medium">
											<ShieldAlert className="w-3.5 h-3.5" />
											Not Verified
										</span>
									)}
								</div>
							)}
						</div>
					</div>
				</motion.div>

				{import.meta.env.VITE_ENABLE_IDENTITY_VERIFICATION === "true" && (
					<VerificationStatus role="students" />
				)}

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
	)
}

