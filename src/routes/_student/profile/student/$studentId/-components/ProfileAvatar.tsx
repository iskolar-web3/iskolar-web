import { useRef } from "react";
import { useAuth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, User } from "lucide-react";
import { getCookie } from "@/lib/cookie";
import { ACCESS_TOKEN_KEY } from "@/lib/user/auth";
import { uploadFile } from "@/lib/api";
import type { Student, UpdateStudentRequest } from "@/lib/student/model";

type ProfileAvatarProps = {
	onSubmit: (data: UpdateStudentRequest) => Promise<void>;
};

export default function ProfileAvatar(props: ProfileAvatarProps) {
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
