import {
	Accessibility,
	FlaskConical,
	GraduationCap,
	HandHeart,
	Landmark,
	Palette,
	Plane,
	Plus,
	Search,
	Trophy,
	Users,
	Wheat,
	Wrench,
} from "lucide-react";
import { useState } from "react";
import { ScholarshipType } from "@/lib/scholarship/model";
import {
	SCHOLARSHIP_TEMPLATES,
	type ScholarshipTemplate,
} from "@/lib/scholarship/templates";

const ICON_MAP: Record<string, React.ElementType> = {
	Accessibility,
	FlaskConical,
	GraduationCap,
	HandHeart,
	Landmark,
	Palette,
	Plane,
	Trophy,
	Users,
	Wheat,
	Wrench,
};

const TYPE_LABELS: Record<ScholarshipType, string[]> = {
	[ScholarshipType.MeritBased]: ["Merit-Based"],
	[ScholarshipType.NeedBased]: ["Need-Based"],
	[ScholarshipType.Combined]: ["Merit-Based", "Need-Based"],
};

interface TemplateSelectionStepProps {
	onSelectTemplate: (template: ScholarshipTemplate) => void;
	onStartFromScratch: () => void;
}

export default function TemplateSelectionStep({
	onSelectTemplate,
	onStartFromScratch,
}: TemplateSelectionStepProps) {
	const [query, setQuery] = useState("");

	const filtered = query.trim()
		? SCHOLARSHIP_TEMPLATES.filter((t) => {
				const q = query.toLowerCase();
				return (
					t.name.toLowerCase().includes(q) ||
					t.description.toLowerCase().includes(q) ||
					t.criterias.some((c) => c.toLowerCase().includes(q)) ||
					t.requirements.some((r) => r.toLowerCase().includes(q))
				);
			})
		: SCHOLARSHIP_TEMPLATES;

	return (
		<div className="max-w-4xl mx-auto py-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4 mb-5">
				<div>
					<h1 className="text-2xl text-primary mb-1">Create a Scholarship</h1>
					<p className="text-sm text-[#6B7280]">
						Choose a template to get started quickly.
					</p>
				</div>
				<button
					type="button"
					onClick={onStartFromScratch}
					className="shrink-0 flex items-center gap-1.5 text-sm bg-secondary text-tertiary/90 hover:text-tertiary cursor-pointer transition-colors border border-[#C4CBD5] hover:border-[#3A52A6] rounded-sm px-3 py-2 whitespace-nowrap mt-1"
				>
					<Plus size={14} />
					Start from scratch
				</button>
			</div>

			{/* Search */}
			<div className="relative mb-6">
				<Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search templates..."
					className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#C4CBD5] rounded-sm bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#3A52A6]/20 focus:border-[#3A52A6] transition-all text-primary placeholder:text-[#9CA3AF]"
				/>
			</div>

			{/* Grid */}
			{filtered.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{filtered.map((template) => {
						const Icon = ICON_MAP[template.icon];
						const badges = TYPE_LABELS[template.scholarshipType];
						return (
							<button
								key={template.id}
								type="button"
								onClick={() => onSelectTemplate(template)}
								className="cursor-pointer text-left bg-[#F8F9FC] rounded-lg p-5 border border-[#D3DCF6] hover:border-[#3A52A6]/30 hover:shadow-md transition-all group"
							>
								<div className="flex items-center gap-3 mb-3">
									{Icon && (
										<div className="w-10 h-10 rounded-lg border border-[#3A52A6] bg-transparent flex items-center justify-center text-[#3A52A6] group-hover:bg-[#3A52A6] group-hover:text-white transition-colors shrink-0">
											<Icon size={20} />
										</div>
									)}
									<div>
										<h3 className="text-sm font-medium text-primary">
											{template.name}
										</h3>
										<div className="flex flex-wrap gap-1.5 text-[10px] text-[#3A52A6]">
											{badges.map((b) => (
												<span key={b}>{b}</span>
											))}
										</div>
									</div>
								</div>

								<p className="text-xs text-[#6B7280] mb-4 leading-relaxed">
									{template.description}
								</p>

								<div className="text-[11px] text-[#9CA3AF] space-y-0.5">
									<p>{template.criterias.length} criteria</p>
									<p>{template.requirements.length} documents</p>
									<p>{template.formFields.length} questions</p>
								</div>
							</button>
						);
					})}

					<button
						type="button"
						onClick={onStartFromScratch}
						className="cursor-pointer text-left rounded-xl p-5 border-2 border-dashed border-[#C4CBD5] hover:border-[#3A52A6] hover:bg-[#F8F9FC] transition-all group flex flex-col items-center justify-center min-h-[200px]"
					>
						<div className="w-10 h-10 rounded-md border border-[#6B7280] bg-transparent flex items-center justify-center text-[#6B7280] group-hover:bg-[#3A52A6] group-hover:border-[#3A52A6] group-hover:text-white transition-colors mb-3">
							<Plus size={20} />
						</div>
						<h3 className="text-sm text-primary mb-1">
							Start from Scratch
						</h3>
						<p className="text-xs text-[#6B7280] text-center">
							Build your scholarship from the ground up.
						</p>
					</button>
				</div>
			) : (
				<div className="text-center py-16 text-[#9CA3AF]">
					<Search size={32} className="mx-auto mb-3 opacity-40" />
					<p className="text-sm">No templates found for "{query}"</p>
					<button
						type="button"
						onClick={onStartFromScratch}
						className="mt-4 text-sm text-[#3A52A6] hover:underline cursor-pointer"
					>
						Start from scratch instead
					</button>
				</div>
			)}
		</div>
	);
}
