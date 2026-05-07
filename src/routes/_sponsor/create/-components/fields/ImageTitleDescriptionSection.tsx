import { Upload, X } from "lucide-react";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { ScholarshipFormData } from "@/lib/scholarship/model";

const DEFAULT_SCHOLARSHIP_IMAGE = "/scholarship-banner-placeholder.png";

interface Props {
	imagePreview: string | null;
	handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	removeImage: () => void;
	control: Control<ScholarshipFormData, any, any>;
	errors: FieldErrors<ScholarshipFormData>;
	disabled: boolean;
}

export default function ImageTitleDescriptionSection({
	imagePreview,
	handleImageUpload,
	removeImage,
	control,
	errors,
	disabled,
}: Props) {
	return (
		<div className="flex flex-col md:flex-row gap-4 items-stretch">
			{/* Image Upload */}
			<div className="md:w-[218px] shrink-0">
				<label className="block h-full">
					{imagePreview ? (
						<div className="relative w-full h-full min-h-[218px] rounded-lg overflow-hidden">
							<img
								src={imagePreview}
								alt="Preview"
								className="w-full h-full object-cover"
							/>
							<button
								type="button"
								disabled={disabled}
								onClick={removeImage}
								className="absolute top-2 right-2 bg-black/50 text-tertiary rounded-full p-1.5 hover:bg-black/70 cursor-pointer"
							>
								<X size={14} />
							</button>
						</div>
					) : (
						<div className="relative w-full h-full min-h-[218px] rounded-lg overflow-hidden cursor-pointer group">
							<img
								src={DEFAULT_SCHOLARSHIP_IMAGE}
								alt="Default scholarship banner"
								className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							/>
							<div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
							<div className="absolute right-3 bottom-3 rounded-md bg-white/92 px-3 py-2 text-xs text-primary shadow-sm backdrop-blur-sm">
								<div className="flex items-center gap-2">
									<Upload size={14} className="text-secondary" />
									<span>Upload an image</span>
								</div>
							</div>
							<input
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								className="hidden"
							/>
						</div>
					)}
				</label>
			</div>

			{/* Title + Description */}
			<div className="flex-1 flex flex-col justify-between min-h-[218px] space-y-4">
				<div>
					<label className="block text-xs text-[#6B7280] mb-1 ml-0.5">
						Title <span className="text-[#EF4444]">*</span>
					</label>
					<Controller
						control={control}
						name="name"
						render={({ field }) => (
							<input
								{...field}
								placeholder="Enter Scholarship Title"
								maxLength={100}
								disabled={disabled}
								className={`w-full text-2xl border-b-2 ${
									errors.name ? "border-[#EF4444]" : "border-[#C4CBD5]"
								} bg-transparent pb-2 focus:outline-none focus:border-[#3A52A6] text-primary transition-colors`}
							/>
						)}
					/>
					{errors.name && (
						<p className="text-xs text-[#EF4444] mt-1">{errors.name.message}</p>
					)}
				</div>

				<div className="flex-1">
					<label className="block text-xs text-[#6B7280] mb-1 ml-0.5">
						Description
					</label>
					<Controller
						control={control}
						name="description"
						render={({ field }) => (
							<textarea
								{...field}
								value={field.value ?? ""}
								disabled={disabled}
								maxLength={1000}
								placeholder="Add details like qualifications, background, or any special notes applicants should know before applying."
								className={`w-full h-full min-h-[140px] max-h-[140px] resize-none rounded-lg border ${
									errors.description ? "border-[#EF4444]" : "border-[#C4CBD5]"
								} bg-[#F8F9FC] px-4 py-3 text-sm text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
							/>
						)}
					/>
					{errors.description && (
						<p className="text-xs text-[#EF4444] mt-1">
							{errors.description.message}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
