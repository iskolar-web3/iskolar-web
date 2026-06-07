import { useRef } from "react";
import { useAuth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, User, Building2 } from "lucide-react";
import { uploadFile } from "@/lib/api";
import { SponsorType, type AnySponsor, type UpdateIndividualSponsorRequest, type UpdateOrganizationSponsorRequest, type UpdateGovernmentSponsorRequest } from "@/lib/sponsor/model";

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

export default function ProfileAvatar(props: ProfileAvatarProps) {
	const auth = useAuth<AnySponsor>();
	const fileInputRef = useRef<HTMLInputElement>(null);

	async function handleImageUpload(
		e: React.ChangeEvent<HTMLInputElement>,
	): Promise<void> {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		const uploadRes = await uploadFile(file, "profile-images");

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
