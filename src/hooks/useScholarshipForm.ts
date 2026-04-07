import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
// import { useAuth } from "@/auth";
// import type { AnySponsor } from "@/lib/sponsor/model";
import { uploadFile } from "@/lib/api";
import { getCookie } from "@/lib/cookie";
import {
	createScholarshipRequestSchema,
	type ScholarshipFormData,
	ScholarshipStatus,
} from "@/lib/scholarship/model";
import { ACCESS_TOKEN_KEY } from "@/lib/user/auth";
import { normalizeText } from "@/utils/normalize.utils";

/**
 * Custom hook for managing scholarship creation/edit form
 * Provides form state management, validation, and helper functions for:
 * - Image upload and preview
 * - Dynamic criteria list management
 * - Dynamic required documents list management
 * - Custom form fields management
 *
 * @returns Object containing:
 *   - form: React Hook Form instance with Zod validation
 *   - imagePreview: Current image preview URL
 *   - criteriaInput: Input state for adding criteria
 *   - setCriteriaInput: Setter for criteria input
 *   - documentsInput: Input state for adding documents
 *   - setDocumentsInput: Setter for documents input
 *   - handleImageUpload: Function to handle image file upload
 *   - removeImage: Function to remove uploaded image
 *   - addCriterion: Function to add a new criterion
 *   - removeCriterion: Function to remove a criterion by index
 *   - addDocument: Function to add a new required document
 *   - removeDocument: Function to remove a document by index
 *   - resetForm: Function to reset entire form state
 */
export function useScholarshipForm(sponsorId: string) {
	const defaultFormValues: Partial<ScholarshipFormData> = {
		name: "",
		description: "",
		scholarshipType: undefined,
		status: ScholarshipStatus.Draft,
		totalAmount: undefined,
		totalAmountMin: undefined,
		totalAmountMax: undefined,
		totalSlots: undefined,
		applicationDeadline: undefined,
		imageUrl: undefined,
		criterias: [],
		requirements: [],
		sponsorId,
		formFields: [],
	};

	const form = useForm<ScholarshipFormData>({
		// @ts-expect-error This works fine but it has TS error for some reason
		resolver: zodResolver(createScholarshipRequestSchema),
		mode: "onBlur",
		defaultValues: defaultFormValues,
	});

	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [criteriaInput, setCriteriaInput] = useState("");
	const [documentsInput, setDocumentsInput] = useState("");

	const criteria = form.watch("criterias");
	const requirements = form.watch("requirements");

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const result = reader.result as string;
				setImagePreview(result);
			};
			reader.readAsDataURL(file);

			const token = getCookie(ACCESS_TOKEN_KEY);
			if (token) {
				const uploadRes = await uploadFile(file, token, "scholarship-images");
				console.log("Scholarship image upload:", uploadRes);

				form.setValue("imageUrl", uploadRes.data.url, {
					shouldValidate: true,
				});
				console.log("Set scholarship imageUrl value");
			}
		}
	};

	const removeImage = useCallback(() => {
		setImagePreview(null);
		form.setValue("imageUrl", undefined, { shouldValidate: false });
	}, [form]);

	const addCriterion = useCallback(() => {
		const normalized = normalizeText(criteriaInput);
		if (normalized && !criteria.includes(normalized)) {
			form.setValue("criterias", [...criteria, normalized], {
				shouldValidate: true,
			});
			setCriteriaInput("");
		}
	}, [criteria, criteriaInput, form]);

	const removeCriterion = useCallback(
		(index: number) => {
			form.setValue(
				"criterias",
				criteria.filter((_, i) => i !== index),
			);
		},
		[criteria, form],
	);

	const addDocument = useCallback(() => {
		const normalized = normalizeText(documentsInput);
		if (normalized && !requirements.includes(normalized)) {
			form.setValue("requirements", [...requirements, normalized], {
				shouldValidate: true,
			});
			setDocumentsInput("");
		}
	}, [documentsInput, requirements, form]);

	const addCriterionDirect = useCallback(
		(value: string) => {
			const normalized = normalizeText(value);
			if (normalized && !criteria.includes(normalized)) {
				form.setValue("criterias", [...criteria, normalized], {
					shouldValidate: true,
				});
			}
		},
		[criteria, form],
	);

	const addDocumentDirect = useCallback(
		(value: string) => {
			const normalized = normalizeText(value);
			if (normalized && !requirements.includes(normalized)) {
				form.setValue("requirements", [...requirements, normalized], {
					shouldValidate: true,
				});
			}
		},
		[requirements, form],
	);

	const removeDocument = useCallback(
		(index: number) => {
			form.setValue(
				"requirements",
				requirements.filter((_, i) => i !== index),
			);
		},
		[requirements, form],
	);

	const resetForm = useCallback(() => {
		form.reset(defaultFormValues);
		setImagePreview(null);
		setCriteriaInput("");
		setDocumentsInput("");
	}, [defaultFormValues, form]);

	return {
		form,
		imagePreview,
		criteriaInput,
		setCriteriaInput,
		documentsInput,
		setDocumentsInput,
		handleImageUpload,
		removeImage,
		addCriterion,
		removeCriterion,
		addDocument,
		removeDocument,
		addCriterionDirect,
		addDocumentDirect,
		resetForm,
	};
}
