import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { User as UserIcon, ShieldCheck, ShieldAlert } from "lucide-react";
import { handleError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/auth";
import { UserRole, type User } from "@/lib/user/model";
import type { Student } from "@/lib/student/model";
import { getSponsorName } from "@/lib/sponsor/api";
import type { AnySponsor } from "@/lib/sponsor/model";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { VerificationStatus } from "@/lib/verification/model";

// const USE_MOCK_DATA = true;

/**
 * Props for the ProfileDropdown component
 */
interface ProfileDropdownProps {
	/** Callback function to close the dropdown */
	onClose: () => void;
}

/**
 * Gets the display name based on user profile type using type guards
 * @param user - User profile
 * @returns Display name
 */
function getDisplayName(user: User, profile: any): string {
	switch (user.role?.code) {
		case UserRole.Student:
			const student = profile as Student;
			return `${student.firstName} ${student.lastName}`;
		case UserRole.Sponsor:
			const sponsor = profile as AnySponsor;
			return getSponsorName(sponsor);
		default:
			// Exhaustiveness check
			return "";
	}
}

/**
 * Profile dropdown component
 * Displays user profile information with account and logout options
 * Redirects to appropriate profile page based on user role
 */
export default function ProfileDropdown({ onClose }: ProfileDropdownProps) {
	const navigate = useNavigate();
	const { toast } = useToast();

	const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
	// const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	// const [isLoading, setIsLoading] = useState(true);

	const auth = useAuth<any>();

	const verificationEnabled = import.meta.env.VITE_ENABLE_IDENTITY_VERIFICATION === "true";
	const roleCode = auth.user?.role?.code;
	const verificationRole: "students" | "sponsors" = roleCode === UserRole.Sponsor ? "sponsors" : "students";
	const verificationQuery = useVerificationStatus(
		verificationRole,
		verificationEnabled && (roleCode === UserRole.Student || roleCode === UserRole.Sponsor),
	);
	const isVerified = verificationQuery.isLoading || verificationQuery.data?.status === VerificationStatus.Verified;

	/**
	 * Fetch user profile on component mount
	 */
	// useEffect(() => {
	//   const fetchUserProfile = async () => {
	//     try {
	//       const result = await profileService.getUserProfile(userProfile?.user_id || '');
	//       if (result.success && result.profile) {
	//         setUserProfile(result.profile);
	//       } else {
	//         // Mock data fallback for development
	//         if (USE_MOCK_DATA) {
	//           logger.info('Using mock data for development');
	//           setUserProfile(mockStudentUser);
	//         } else {
	//           showError(`Error`, result.message || 'Failed to load profile', 2500);
	//         }
	//       }
	//     } catch (err) {
	//       const handled = handleError(err, 'Failed to fetch user profile');
	//       logger.error('Fetch user profile error:', handled.raw);
	//       showError(`Error ${handled.code}`, handled.message, 2500);
	//     } finally {
	//       setIsLoading(false);
	//     }
	//   };
	//
	//   fetchUserProfile();
	// }, []);

	/**
	 * Determines the profile route based on user role
	 */
	const getProfileRoute = () => {
		if (!auth.user) return null;

		switch (auth.user.role?.code) {
			case UserRole.Student:
				return {
					to: "/profile/student/$studentId" as const,
					params: { studentId: auth.profile.id },
				};
			case UserRole.Sponsor:
				return {
					to: "/profile/sponsor/$sponsorId" as const,
					params: { sponsorId: auth.profile.id },
				};
			// case 'school':
			// Uncomment when school route is ready
			// return { to: '/profile/school/$schoolId' as const, params: { schoolId: userId } };
			// return null;
			default:
				return null;
		}
	};

	/**
	 * Handles profile navigation
	 */
	const handleProfileClick = () => {
		onClose();
		const route = getProfileRoute();
		if (route) {
			navigate(route);
		}
	};

	/**
	 * Handles account navigation
	 */
	// const handleAccountClick = () => {
	// 	onClose();
	// 	// navigate({ to: '/account' });
	// };

	/**
	 * Handles user logout
	 */
	const handleLogout = async () => {
		try {
			await auth.logout();
			setShowLogoutConfirmation(false);
			onClose();
			await navigate({ to: "/login" });
		} catch (err) {
			const handled = handleError(err, "Failed to logout");
			logger.error("Logout error:", handled.raw);
			setShowLogoutConfirmation(false);
		}
	};

	return (
		<>
			{toast && <Toast {...toast} />}

			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.2 }}
				className="absolute right-0 top-8 md:top-10 mt-2 w-40 md:w-56 bg-white rounded-lg shadow-lg border border-border z-50 overflow-hidden"
			>
				{/* Profile Section */}
				<button
					type="button"
					onClick={handleProfileClick}
					disabled={!auth.user}
					className="w-full px-3 md:px-4 py-2 md:py-3 border-b border-border hover:bg-[#F9FAFB] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
				>
					<div className="flex items-center gap-3">
						<div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
							{auth.user?.avatarUrl ? (
								<img
									src={auth.user.avatarUrl}
									alt={getDisplayName(auth.user, auth.profile)}
									className="w-full h-full rounded-full object-cover"
								/>
							) : (
								<UserIcon className="w-4 md:w-5 h-4 md:h-5 text-[#6B7280]" />
							)}
						</div>
						<div className="min-w-0 flex-1 text-left">
							{auth.user ? (
								<p className="text-xs md:text-sm text-primary truncate">
									{getDisplayName(auth.user, auth.profile)}
								</p>
							) : null}
							{verificationEnabled && !verificationQuery.isLoading && (roleCode === UserRole.Student || roleCode === UserRole.Sponsor) && (
								isVerified ? (
									<span className="inline-flex items-center gap-1 text-[10px] text-green-600 mt-0.5">
										<ShieldCheck className="w-3 h-3" />
										Verified
									</span>
								) : (
									<span className="inline-flex items-center gap-1 text-[10px] text-amber-600 mt-0.5">
										<ShieldAlert className="w-3 h-3" />
										Not Verified
									</span>
								)
							)}
						</div>
					</div>
				</button>

				{/* Account Option */}
				{/* <button
					type="button"
					onClick={handleAccountClick}
					disabled={!auth.user}
					className="w-full px-3 cursor-pointer md:px-4 py-2 md:py-3 text-left text-xs md:text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition-colors border-b border-border disabled:cursor-not-allowed disabled:opacity-60"
				>
					Account
				</button> */}

				{/* Logout Option */}
				<button
					type="button"
					onClick={() => setShowLogoutConfirmation(true)}
					className="w-full px-3 md:px-4 py-2 md:py-3 cursor-pointer text-left text-xs md:text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
				>
					Logout
				</button>
			</motion.div>

			{/* Logout Confirmation Modal */}
			<AnimatePresence>
				{showLogoutConfirmation && (
					<div
						className="fixed inset-0 z-60 flex items-center justify-center bg-black/50"
						onClick={() => setShowLogoutConfirmation(false)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.2 }}
							className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 py-4 px-5"
							onClick={(e) => e.stopPropagation()}
						>
							<h3 className="text-lg text-primary mb-2">Confirm Logout</h3>
							<p className="text-sm text-[#6B7280] mb-6">
								Are you sure you want to logout? You will need to login again to
								access your account.
							</p>
							<div className="flex gap-3 justify-end">
								<button
									type="button"
									onClick={() => setShowLogoutConfirmation(false)}
									className="px-4 py-2 cursor-pointer text-sm text-[#6B7280] hover:bg-[#F9FAFB] rounded-sm transition-colors"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleLogout}
									className="px-4 py-2 cursor-pointer text-sm text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-sm transition-colors"
								>
									Logout
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}
