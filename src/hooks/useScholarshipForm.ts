import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { uploadFile } from "@/lib/api";
import {
	type CreateFormFieldRequest,
	createScholarshipRequestSchema,
	FormFieldType,
	type ScholarshipFormData,
	ScholarshipStatus,
} from "@/lib/scholarship/model";
import { normalizeText } from "@/utils/normalize.utils";

const DRAFT_STORAGE_KEY_PREFIX = "scholarship-create-draft:";

export function generateDocumentFileFields(
	requirements: string[],
	existingFormFields: CreateFormFieldRequest[],
): CreateFormFieldRequest[] {
	const added: CreateFormFieldRequest[] = [];
	for (const doc of requirements) {
		const alreadyExists = existingFormFields.some(
			(f) => f.label === doc && f.fieldType === FormFieldType.File,
		);
		if (!alreadyExists) {
			added.push({
				label: doc,
				fieldType: FormFieldType.File,
				isRequired: true,
				options: [],
			});
		}
	}
	return [...existingFormFields, ...added];
}

export const DEFAULT_APPLICATION_QUESTION: CreateFormFieldRequest = {
	label: "Why are you applying for this scholarship?",
	fieldType: FormFieldType.Paragraph,
	isRequired: true,
	options: [],
};

function getDraftKey(sponsorId: string) {
	return `${DRAFT_STORAGE_KEY_PREFIX}${sponsorId}`;
}

function loadDraft(sponsorId: string): Partial<ScholarshipFormData> | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(getDraftKey(sponsorId));
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<ScholarshipFormData> & {
			applicationDeadline?: string | Date;
		};
		if (parsed.applicationDeadline) {
			const d = new Date(parsed.applicationDeadline);
			parsed.applicationDeadline = Number.isNaN(d.getTime()) ? undefined : d;
		}
		return parsed as Partial<ScholarshipFormData>;
	} catch {
		return null;
	}
}

function clearDraft(sponsorId: string) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.removeItem(getDraftKey(sponsorId));
	} catch {
		// ignore
	}
}

const DEFAULT_DEADLINE_DAYS_FROM_NOW = 30;

function getDefaultApplicationDeadline(): Date {
	const deadline = new Date();
	deadline.setDate(deadline.getDate() + DEFAULT_DEADLINE_DAYS_FROM_NOW);
	return deadline;
}

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
		applicationDeadline: getDefaultApplicationDeadline(),
		imageUrl: undefined,
		criterias: [],
		requirements: [],
		sponsorId,
		formFields: [],
	};

	const form = useForm<ScholarshipFormData>({
		// @ts-expect-error This works fine but it has TS error for some reason
		resolver: zodResolver(createScholarshipRequestSchema),
		mode: "onChange",
		defaultValues: defaultFormValues,
	});

	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [criteriaInput, setCriteriaInput] = useState("");
	const [documentsInput, setDocumentsInput] = useState("");

	const criteria = form.watch("criterias");
	const requirements = form.watch("requirements");

	// Restore draft from localStorage on mount.
	const didRestoreRef = useRef(false);
	useEffect(() => {
		if (didRestoreRef.current) return;
		didRestoreRef.current = true;
		const draft = loadDraft(sponsorId);
		if (draft) {
			form.reset({ ...defaultFormValues, ...draft, sponsorId });
		}
		// Intentionally only run once on mount; defaultFormValues is recreated
		// every render and would cause an infinite loop in the dep array.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sponsorId]);

	// Debounced autosave to localStorage on any form change.
	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout> | null = null;
		const subscription = form.watch((values) => {
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(() => {
				if (typeof window === "undefined") return;
				try {
					const persisted = { ...values };
					if (
						typeof persisted.imageUrl === "string" &&
						persisted.imageUrl.startsWith("data:")
					) {
						persisted.imageUrl = undefined;
					}
					window.localStorage.setItem(
						getDraftKey(sponsorId),
						JSON.stringify(persisted),
					);
				} catch {
					// ignore quota / serialization errors
				}
			}, 500);
		});
		return () => {
			if (timeout) clearTimeout(timeout);
			subscription.unsubscribe();
		};
	}, [form, sponsorId]);

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const result = reader.result as string;
				setImagePreview(result);
			};
			reader.readAsDataURL(file);

			const uploadRes = await uploadFile(file, "scholarship-images");
			console.log("Scholarship image upload:", uploadRes);

			form.setValue("imageUrl", uploadRes.data.url, {
				shouldValidate: true,
			});
			console.log("Set scholarship imageUrl value");
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
				const currentFields = form.getValues("formFields") || [];
				const alreadyExists = currentFields.some(
					(f) => f.label === normalized && f.fieldType === FormFieldType.File,
				);
				if (!alreadyExists) {
					form.setValue(
						"formFields",
						[
							...currentFields,
							{
								label: normalized,
								fieldType: FormFieldType.File,
								isRequired: true,
								options: [],
							},
						],
						{ shouldValidate: true },
					);
				}
			}
		},
		[requirements, form],
	);

	const removeDocument = useCallback(
		(index: number) => {
			const removedDoc = requirements[index];
			form.setValue(
				"requirements",
				requirements.filter((_, i) => i !== index),
			);
			if (removedDoc) {
				const currentFields = form.getValues("formFields") || [];
				form.setValue(
					"formFields",
					currentFields.filter(
						(f) => !(f.label === removedDoc && f.fieldType === FormFieldType.File),
					),
					{ shouldValidate: true },
				);
			}
		},
		[requirements, form],
	);

	const resetForm = useCallback(() => {
		form.reset(defaultFormValues);
		setImagePreview(null);
		setCriteriaInput("");
		setDocumentsInput("");
		clearDraft(sponsorId);
	}, [defaultFormValues, form, sponsorId]);

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
