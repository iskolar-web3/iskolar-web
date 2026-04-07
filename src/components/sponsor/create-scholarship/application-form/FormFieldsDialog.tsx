import { Info, Plus } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CreateFormFieldRequest } from "@/lib/scholarship/model";
import CustomFormFieldModal from "./CustomFormFieldModal";
import CustomFormFieldsList from "./CustomFormFieldsList";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	draftFormFields: CreateFormFieldRequest[];
	setDraftFormFields: (fields: CreateFormFieldRequest[]) => void;
	onSave: () => void;
	loading: boolean;
	hasError: boolean;
	editingFieldIndex: number | null;
	setEditingFieldIndex: (index: number | null) => void;
	showCustomFieldModal: boolean;
	setShowCustomFieldModal: (show: boolean) => void;
}

export default function FormFieldsDialog({
	open,
	onOpenChange,
	draftFormFields,
	setDraftFormFields,
	onSave,
	loading,
	hasError,
	editingFieldIndex,
	setEditingFieldIndex,
	showCustomFieldModal,
	setShowCustomFieldModal,
}: Props) {
	const openCustomFormModal = (index?: number) => {
		setEditingFieldIndex(index ?? null);
		setShowCustomFieldModal(true);
	};

	const handleSaveCustomField = (field: CreateFormFieldRequest) => {
		if (editingFieldIndex !== null) {
			setDraftFormFields(
				draftFormFields.map((f, i) => (i === editingFieldIndex ? field : f)),
			);
		} else {
			setDraftFormFields([...draftFormFields, field]);
		}
		setEditingFieldIndex(null);
	};

	const removeCustomFormField = (index: number) => {
		setDraftFormFields(draftFormFields.filter((_, i) => i !== index));
	};

	const handleClose = () => {
		onOpenChange(false);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<div className="flex items-center gap-2">
							<DialogTitle className="font-normal">Application Form</DialogTitle>
							<TooltipProvider delayDuration={100}>
								<Tooltip>
									<TooltipTrigger asChild>
										<Info
											size={15}
											className="text-[#6B7280] cursor-pointer shrink-0"
										/>
									</TooltipTrigger>
									<TooltipContent
										side="right"
										className="max-w-59 text-xs bg-[#3A52A6] text-white [--tooltip-arrow-color:#3A52A6]"
									>
										Name, gender, email, date of birth, contact number, education
										level, and school name are already in the student profile -
										no need to include them here.
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						<DialogDescription className="text-[#6B7280] font-normal">
							Create and manage questionnaires like essays, personal info, file
							uploads, and more.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<CustomFormFieldsList
							fields={draftFormFields}
							onEdit={openCustomFormModal}
							onRemove={removeCustomFormField}
							disabled={loading}
						/>

						<button
							type="button"
							disabled={loading}
							onClick={() => openCustomFormModal()}
							className={`w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed ${
								hasError ? "border-[#EF4444]" : "border-[#3A52A6]"
							} bg-[#E0ECFF] text-secondary text-sm rounded-lg hover:bg-[#D0DCFF] transition-colors`}
						>
							<Plus size={20} />
							Add Form Field
						</button>

						<DialogFooter className="pt-3">
							<button
								type="button"
								disabled={loading}
								onClick={handleClose}
								className="cursor-pointer px-4 py-2 rounded-md border border-[#C4CBD5] text-primary text-sm hover:bg-[#F3F4F6] transition-colors"
							>
								Discard Changes
							</button>
							<button
								type="button"
								disabled={loading}
								onClick={onSave}
								className="cursor-pointer px-4 py-2 rounded-md bg-[#3A52A6] text-tertiary text-sm hover:bg-[#2A4296] transition-colors"
							>
								Save Changes
							</button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>

			<CustomFormFieldModal
				isOpen={showCustomFieldModal}
				onClose={() => {
					setShowCustomFieldModal(false);
					setEditingFieldIndex(null);
				}}
				onSave={handleSaveCustomField}
				editingField={
					editingFieldIndex !== null ? draftFormFields[editingFieldIndex] : null
				}
			/>
		</>
	);
}
