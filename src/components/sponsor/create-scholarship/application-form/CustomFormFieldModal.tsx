import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { normalizeText } from "@/utils/normalize.utils";
import {
	FormFieldType,
	type CreateFormFieldOptionRequest,
	type CreateFormFieldRequest,
} from "@/lib/scholarship/model";
import { getFieldTypeLabel, renderFieldTypeIcon } from "@/utils/formField.utils";

/**
 * Props for the CustomFormFieldModal component
 */
interface CustomFormFieldModalProps {
	/** Whether the modal is open */
	isOpen: boolean;
	/** Callback function to close the modal */
	onClose: () => void;
	/** Callback function when field is saved */
	onSave: (field: CreateFormFieldRequest) => void;
	/** Existing field data when editing */
	editingField?: CreateFormFieldRequest | null;
}

/**
 * Custom form field modal component for sponsors
 * Allows creating and editing custom form fields for scholarship applications
 * @param props - Component props
 * @returns Modal dialog for managing custom form fields
 */
export default function CustomFormFieldModal({
	isOpen,
	onClose,
	onSave,
	editingField,
}: CustomFormFieldModalProps) {
	const [errors, setErrors] = useState<{
		label?: string;
		options?: string;
	}>({});
	const [newFieldType, setNewFieldType] = useState<FormFieldType>(
		editingField?.fieldType || FormFieldType.ShortAnswer,
	);
	const [newFieldLabel, setNewFieldLabel] = useState(editingField?.label || "");
	const [newFieldRequired, setNewFieldRequired] = useState(
		editingField?.isRequired || false,
	);
	const [dropdownOptions, setDropdownOptions] = useState<
		CreateFormFieldOptionRequest[]
	>(editingField?.options || []);
	const [dropdownOptionInput, setDropdownOptionInput] = useState("");

	useEffect(() => {
		if (editingField) {
			setNewFieldType(editingField.fieldType);
			setNewFieldLabel(editingField.label);
			setNewFieldRequired(editingField.isRequired);
			setDropdownOptions(editingField.options || []);
		} else {
			setNewFieldType(FormFieldType.ShortAnswer);
			setNewFieldLabel("");
			setNewFieldRequired(false);
			setDropdownOptions([]);
		}
		setDropdownOptionInput("");
		setErrors({});
	}, [editingField, isOpen]);

	/**
	 * Handles saving the form field
	 * Validates and normalizes input before calling onSave callback
	 */
	const handleSave = () => {
		const normalized = normalizeText(newFieldLabel);
		const typesWithOptions = [
			FormFieldType.Dropdown,
			FormFieldType.Checkbox,
			FormFieldType.MultipleChoice,
		];
		const nextErrors: {
			label?: string;
			options?: string;
		} = {};

		if (!normalized) {
			nextErrors.label = "Field label is required";
		}

		if (typesWithOptions.includes(newFieldType) && dropdownOptions.length === 0) {
			nextErrors.options = "Add at least one option";
		}

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		const newField: CreateFormFieldRequest = {
			fieldType: newFieldType,
			label: normalized,
			isRequired: newFieldRequired,
			options: dropdownOptions,
		};

		onSave(newField);
		onClose();
	};

	/**
	 * Handles adding a new option to dropdown/checkbox/multiple choice fields
	 */
	const handleAddOption = () => {
		const trimmed = dropdownOptionInput.trim();
		if (trimmed && !dropdownOptions.includes({ value: trimmed })) {
			setDropdownOptions([...dropdownOptions, { value: trimmed }]);
			setDropdownOptionInput("");
			setErrors((current) => ({ ...current, options: undefined }));
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className="bg-tertiary border-0 py-4 px-6 max-w-md max-h-[90vh] overflow-y-auto"
				showCloseButton={true}
			>
				<DialogHeader>
					<h3 className="text-lg text-secondary">
						{editingField ? "Edit Field" : "Add Form Field"}
					</h3>
				</DialogHeader>

				<div className="space-y-4">
					<div>
						<label className="block text-sm text-[#4A5568] mb-2">
							Field Type <span className="text-[#EF4444]">*</span>
						</label>
						<div className="relative">
							<Select
								value={newFieldType}
								onValueChange={(value) => {
									setNewFieldType(value as FormFieldType);
									setErrors((current) => ({ ...current, options: undefined }));
								}}
							>
								<SelectTrigger className="w-full cursor-pointer px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.values(FormFieldType).map((type) => (
										<SelectItem key={type} value={type} className="cursor-pointer">
											<div className="flex items-center gap-2">
												{renderFieldTypeIcon(type)}
												<span>{getFieldTypeLabel(type)}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div>
						<label className="block text-sm text-[#4A5568] mb-2">
							Field Label <span className="text-[#EF4444]">*</span>
						</label>
						<input
							value={newFieldLabel}
							onChange={(e) => {
								setNewFieldLabel(e.target.value);
								setErrors((current) => ({ ...current, label: undefined }));
							}}
							placeholder="e.g., Full Name, Email, etc."
							className={`w-full px-4 py-3 rounded-lg border ${
								errors.label ? "border-[#EF4444]" : "border-[#C4CBD5]"
							} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
						/>
						{errors.label && (
							<p className="text-xs text-[#EF4444] mt-1">{errors.label}</p>
						)}
					</div>

					<div>
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={newFieldRequired}
								onChange={(e) => setNewFieldRequired(e.target.checked)}
								className="w-4 h-4 rounded border-[#C4CBD5] text-secondary focus:ring-2 focus:ring-[#3A52A6] accent-[#3A52A6]"
							/>
							<span className="text-sm text-primary">Required Field</span>
						</label>
					</div>

					{(newFieldType === "dropdown" ||
						newFieldType === "checkbox" ||
						newFieldType === "multiple_choice") && (
						<div>
							<label className="block text-sm text-[#4A5568] mb-2">
								{newFieldType === "checkbox"
									? "Checkbox Options"
									: newFieldType === "multiple_choice"
										? "Choices"
										: "Dropdown Options"}{" "}
								<span className="text-[#EF4444]">*</span>
							</label>
							<div className="flex gap-2 mb-2">
								<input
									value={dropdownOptionInput}
									onChange={(e) => setDropdownOptionInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											const normalized = normalizeText(dropdownOptionInput);
											if (
												normalized &&
												!dropdownOptions.includes({ value: normalized })
											) {
												setDropdownOptions([
													...dropdownOptions,
													{ value: normalized },
												]);
												setDropdownOptionInput("");
												setErrors((current) => ({
													...current,
													options: undefined,
												}));
											}
										}
									}}
									placeholder="Enter option"
									className={`flex-1 px-4 py-3 rounded-lg border ${
										errors.options ? "border-[#EF4444]" : "border-[#C4CBD5]"
									} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
								/>
								<button
									type="button"
									onClick={handleAddOption}
									className="w-11 h-11 bg-[#3A52A6] text-tertiary rounded-lg flex items-center justify-center hover:bg-[#2A4296] transition-colors cursor-pointer"
								>
									<Plus size={20} />
								</button>
							</div>
							{errors.options && (
								<p className="text-xs text-[#EF4444] mt-1 mb-2">{errors.options}</p>
							)}
							{dropdownOptions.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{dropdownOptions.map((option, index) => (
										<span
											key={index}
											className="inline-flex items-center gap-2 px-3 py-2 border border-border bg-[#F9FAFB] text-primary text-xs rounded-md"
										>
											{option.value}
											<button
												onClick={() =>
													setDropdownOptions(
														dropdownOptions.filter((_, i) => i !== index),
													)
												}
												className="hover:text-[#2A4296] cursor-pointer"
											>
												<X size={14} />
											</button>
										</span>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				<DialogFooter className="flex gap-3 mt-6">
					<button
						onClick={onClose}
						className="flex-1 py-2.5 border border-[#C4CBD5] cursor-pointer text-sm rounded-md text-[#4A5568] hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="flex-1 py-2.5 bg-[#3A52A6] cursor-pointer text-sm text-tertiary rounded-md hover:bg-[#2A4296] transition-colors"
					>
						{editingField ? "Update" : "Add"} Field
					</button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
