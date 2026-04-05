import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Controller } from 'react-hook-form';
import {
  Upload,
  X,
  Plus,
  CalendarIcon,
  Loader2,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Toast from '@/components/Toast';
import ScholarshipPreviewCard from '@/components/sponsor/create-scholarship/ScholarshipPreviewCard';
import ScholarshipFullPreviewModal from '@/components/sponsor/create-scholarship/ScholarshipFullPreviewDrawer';
import CustomFormFieldModal from '@/components/sponsor/create-scholarship/CustomFormFieldModal';
import CustomFormFieldsList from '@/components/sponsor/create-scholarship/CustomFormFieldsList';
import DescriptionModal from '@/components/sponsor/create-scholarship/DescriptionModal';
import PresetPickerPopover from '@/components/sponsor/create-scholarship/PresetPickerPopover';
import { PRESET_CRITERIA, PRESET_DOCUMENTS } from '@/lib/scholarship/presets';
import { useScholarshipForm } from '@/hooks/useScholarshipForm';
import { useScholarshipPreview } from '@/hooks/useScholarshipPreview';
import { useToast } from '@/hooks/useToast';
import { SEO } from "@/components/SEO";
import { useAuth } from '@/auth';
import type { AnySponsor } from '@/lib/sponsor/model';
import { ScholarshipStatus, ScholarshipType, type CreateFormFieldRequest, type Scholarship, type ScholarshipFormData } from '@/lib/scholarship/model';
import { BACKEND_URL, type ApiResponse } from '@/lib/api';
import { ACCESS_TOKEN_KEY } from '@/lib/user/auth';
import { getCookie } from '@/lib/cookie';
import { useMutation } from '@tanstack/react-query';

export const Route = createFileRoute('/_sponsor/create')({
  component: CreateScholarship,
});

async function createScholarship(value: ScholarshipFormData): Promise<ApiResponse<Scholarship>> {
	const token = getCookie(ACCESS_TOKEN_KEY);
	const response = await fetch(`${BACKEND_URL}/scholarships`, {
		method: "POST",
		body: JSON.stringify(value),
		headers: { 
            "Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
        },
	});
	const result: ApiResponse<Scholarship> = await response.json();
	if (!response.ok) {
		throw new Error(result.message);
	}

    return result
}


function CreateScholarship() {

  const auth = useAuth<AnySponsor>()
  const {
    form,
    imagePreview,
    handleImageUpload,
    removeImage,
    removeCriterion,
    removeDocument,
    addCriterionDirect,
    addDocumentDirect,
    resetForm,
  } = useScholarshipForm(auth.profile.id);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = form;
  const { toast, showSuccess, showError } = useToast();
  
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amountType, setAmountType] = useState<'fixed' | 'varies' | 'range'>('fixed');
  const [unlimitedSlots, setUnlimitedSlots] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<ScholarshipFormData | null>(null);

  const criteria = watch('criterias');
  const requiredDocuments = watch('requirements');
  const customFormFields = watch('formFields') || [];
  const description = watch('description');
  const title = watch('name');
  const totalAmount = watch('totalAmount');
  const totalAmountMin = watch('totalAmountMin');
  const totalAmountMax = watch('totalAmountMax');
  const totalSlot = watch('totalSlots');
  const applicationDeadline = watch('applicationDeadline');
  const scholarshipType = watch('scholarshipType');
  const imageUrl = watch('imageUrl');

  const { previewScholarship } = useScholarshipPreview({
    scholarshipType,
    name: title,
    description,
    imageUrl,
    totalAmount,
    totalAmountMin,
    totalAmountMax,
    totalSlots: totalSlot,
    applicationDeadline,
    criterias: criteria,
    requirements: requiredDocuments,
    formFields: customFormFields,
    sponsorId: auth.profile.id,
    status: ScholarshipStatus.Draft,
  });

  const openCustomFormModal = (index?: number) => {
    setEditingFieldIndex(index ?? null);
    setShowCustomFieldModal(true);
  };

  const handleSaveCustomField = (field: CreateFormFieldRequest) => {
      console.log(form.formState.errors)
    if (editingFieldIndex !== null) {
      const updatedFields = customFormFields.map((f, i) => 
        i === editingFieldIndex ? field : f
      );
      setValue('formFields', updatedFields);
    } else {
      setValue('formFields', [...customFormFields, field]);
    }
    setEditingFieldIndex(null);
  };

  const removeCustomFormField = (index: number) => {
    setValue('formFields', customFormFields.filter((_, i) => i !== index));
  };

  const handleSaveDescription = (desc: string) => {
    setValue('description', desc);
  };

	const mutation = useMutation({
		mutationFn: createScholarship,
		onSuccess: async (res) => {
            console.log(res.data)
			showSuccess(
				`Success`,
				res.message,
				1250,
			);
      resetForm();
			setLoading(false);
		},
      onError: (err) => {
          showError("Error", err.message)
          console.error(err)
          setLoading(false);
      }
	});

  const onSubmit = async (data: ScholarshipFormData) => {
    if (amountType === 'fixed' && !data.totalAmount) {
      form.setError('totalAmount', { message: 'Please enter a valid amount' });
      return;
    }
    if (amountType === 'range') {
      if (!data.totalAmountMin) {
        form.setError('totalAmountMin', { message: 'Please enter a minimum amount' });
        return;
      }
      if (!data.totalAmountMax) {
        form.setError('totalAmountMax', { message: 'Please enter a maximum amount' });
        return;
      }
      if (data.totalAmountMin >= data.totalAmountMax) {
        form.setError('totalAmountMax', { message: 'Max must be greater than min' });
        return;
      }
    }
    if (!unlimitedSlots && !data.totalSlots) {
      form.setError('totalSlots', { message: 'Please enter the number of slots' });
      return;
    }

    const amountPayload: Partial<ScholarshipFormData> =
      amountType === 'fixed'
        ? { totalAmountMin: undefined, totalAmountMax: undefined }
        : amountType === 'range'
        ? { totalAmount: undefined }
        : { totalAmount: undefined, totalAmountMin: undefined, totalAmountMax: undefined };
    const slotsPayload = unlimitedSlots ? { totalSlots: undefined } : {};
    const imageUrl = data.imageUrl || '/scholarship-banner-placeholder.png';
    const formData = { ...data, ...amountPayload, ...slotsPayload, imageUrl } as ScholarshipFormData;

    setPendingFormData(formData);
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingFormData) return;
    setLoading(true);
    try {
      mutation.mutate(pendingFormData);
      setShowConfirmationModal(false);
    } catch (err) {
      showError('Error', err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SEO title="Create Scholarship" noindex={true} />
      {toast && <Toast {...toast} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-15">
        {/* Scholarship Details */}
        <div className="space-y-4 lg:col-span-8">
          <div className="bg-[#F8F9FC] rounded-xl p-3 shadow-sm space-y-4">
            {/* Row 1: Scholarship Type */}
            <div>
              <label className="block text-xs text-[#6B7280] mb-1.5 ml-0.5">
                Scholarship Type <span className="text-[#EF4444]">*</span>
              </label>
              <Select
                value={scholarshipType}
                onValueChange={(value) =>
                  setValue('scholarshipType', value as ScholarshipType, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  disabled={loading}
                  className={`w-full cursor-pointer px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all data-placeholder:text-gray-600 [&>span]:text-gray-500 ${
                    errors.scholarshipType
                      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444] text-primary'
                      : 'border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary'
                  }`}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ScholarshipType.MeritBased}>
                    <span className="text-primary">Merit-Based</span>{' '}
                    <span className="text-gray-500">
                      (Awarded for grades, skills, or achievements)
                    </span>
                  </SelectItem>

                  <SelectItem value={ScholarshipType.NeedBased}>
                    <span className="text-primary">Need-Based</span>{' '}
                    <span className="text-gray-500">
                      (Awarded based on financial need or limited resources)
                    </span>
                  </SelectItem>

                  <SelectItem value={ScholarshipType.Combined}>
                    <span className="text-primary">Combined</span>{' '}
                    <span className="text-gray-500">
                      (Merit-Based + Need-Based)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.scholarshipType && (
                <p className="text-xs text-[#EF4444] mt-1">{errors.scholarshipType.message}</p>
              )}
            </div>

            {/* Row 2: Image + Title + Description */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="md:w-[218px] shrink-0">
                <label className="block h-full">
                  {imagePreview ? (
                    <div className="relative w-full h-full min-h-[218px] rounded-lg overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        disabled={loading}
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-black/50 text-tertiary rounded-full p-1.5 hover:bg-black/70"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#3A52A6] rounded-lg text-center cursor-pointer hover:bg-[#F0F7FF] transition-colors flex flex-col items-center justify-center w-full h-full min-h-[218px] px-4">
                      <Upload className="mb-3 text-[#5B7BA6]" size={40} />
                      <p className="text-secondary text-sm opacity-70">Click to select an image</p>
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
                        disabled={loading}
                        className={`w-full text-2xl border-b-2 ${
                          errors.name ? 'border-[#EF4444]' : 'border-[#C4CBD5]'
                        } bg-transparent pb-2 focus:outline-none focus:border-[#3A52A6] text-primary transition-colors`}
                      />
                    )}
                  />
                  {errors.name && <p className="text-xs text-[#EF4444] mt-1">{errors.name.message}</p>}
                </div>

                <div className="flex-1">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowDescriptionModal(true)}
                    className="w-full h-full min-h-[140px] max-h-[140px] cursor-pointer rounded-lg bg-[#F3F4F6] border text-sm hover:bg-muted transition-colors text-left overflow-hidden px-4 py-3"
                  >
                    <div className="flex h-full gap-2 overflow-hidden">
                      <span className="text-[#8B9CB5] mt-0.5 shrink-0">☰</span>

                      <div className="flex-1 min-w-0 overflow-hidden">
                        {description ? (
                          <>
                            <p className="text-[#6B7280] mb-2">Edit Description</p>
                            <p
                              className="text-[#6B7280] whitespace-pre-line wrap-break-word overflow-hidden"
                              style={{
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 4,
                              }}
                            >
                              {description}
                            </p>
                          </>
                        ) : (
                          <p className="text-[#6B7280]">Add Description</p>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 3: Amount + Slots + Deadline */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#6B7280]">Scholarship Amount</span>
                  <div className="flex rounded-sm overflow-hidden border border-[#C4CBD5] text-xs h-7">
                    {(['fixed', 'range', 'varies'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setAmountType(t);
                          setValue('totalAmount', undefined);
                          setValue('totalAmountMin', undefined);
                          setValue('totalAmountMax', undefined);
                          form.clearErrors(['totalAmount', 'totalAmountMin', 'totalAmountMax']);
                        }}
                        className={`px-3 capitalize cursor-pointer transition-colors ${
                          amountType === t
                            ? 'bg-[#3A52A6] text-white'
                            : 'bg-[#F8F9FC] text-[#6B7280] hover:bg-gray-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {amountType === 'fixed' && (
                  <Controller
                    control={control}
                    name="totalAmount"
                    render={({ field }) => (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
                          ₱
                        </span>
                        <input
                          {...field}
                          type="number"
                          disabled={loading}
                          placeholder="Amount per scholar"
                          onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                          className={`w-full pl-7 pr-4 py-3 rounded-lg border ${
                            errors.totalAmount ? 'border-[#EF4444]' : 'border-[#C4CBD5]'
                          } bg-[#F8F9FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
                        />
                      </div>
                    )}
                  />
                )}

                {amountType === 'varies' && (
                  <p className="text-xs text-[#6B7280] px-1 py-2.5">
                    Amount varies — describe it in the description field.
                  </p>
                )}

                {amountType === 'range' && (
                  <div className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name="totalAmountMin"
                      render={({ field }) => (
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
                            ₱
                          </span>
                          <input
                            {...field}
                            type="number"
                            disabled={loading}
                            placeholder="Min"
                            onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                            className={`w-full pl-7 pr-3 py-3 rounded-lg border ${
                              errors.totalAmountMin ? 'border-[#EF4444]' : 'border-[#C4CBD5]'
                            } bg-[#F8F9FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
                          />
                        </div>
                      )}
                    />
                    <span className="text-xs text-[#6B7280] shrink-0">to</span>
                    <Controller
                      control={control}
                      name="totalAmountMax"
                      render={({ field }) => (
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
                            ₱
                          </span>
                          <input
                            {...field}
                            type="number"
                            disabled={loading}
                            placeholder="Max"
                            onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                            className={`w-full pl-7 pr-3 py-3 rounded-lg border ${
                              errors.totalAmountMax ? 'border-[#EF4444]' : 'border-[#C4CBD5]'
                            } bg-[#F8F9FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
                          />
                        </div>
                      )}
                    />
                  </div>
                )}

                {errors.totalAmount && <p className="text-xs text-[#EF4444] mt-1">{errors.totalAmount.message}</p>}
                {errors.totalAmountMin && <p className="text-xs text-[#EF4444] mt-1">{errors.totalAmountMin.message}</p>}
                {errors.totalAmountMax && <p className="text-xs text-[#EF4444] mt-1">{errors.totalAmountMax.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#6B7280]">Available Slots</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unlimitedSlots}
                      disabled={loading}
                      onChange={(e) => {
                        setUnlimitedSlots(e.target.checked);
                        if (e.target.checked) {
                          setValue('totalSlots', undefined);
                          form.clearErrors('totalSlots');
                        }
                      }}
                      className="w-3.5 h-3.5 cursor-pointer accent-[#3A52A6]"
                    />
                    <span className="text-xs text-[#6B7280]">No limit</span>
                  </label>
                </div>

                {!unlimitedSlots && (
                  <Controller
                    control={control}
                    name="totalSlots"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        disabled={loading}
                        placeholder="Number of scholars"
                        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.totalSlots ? 'border-[#EF4444]' : 'border-[#C4CBD5]'
                        } bg-[#F8F9FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
                      />
                    )}
                  />
                )}

                {errors.totalSlots && <p className="text-xs text-[#EF4444] mt-1">{errors.totalSlots.message}</p>}
              </div>

              <div>
                <label className="block text-xs text-[#6B7280] mb-1.5 ml-0.5">
                  Application Deadline <span className="text-[#EF4444]">*</span>
                </label>
                <Controller
                  control={control}
                  name="applicationDeadline"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={loading}
                          className={`w-full cursor-pointer px-4 py-3 text-sm border rounded-lg bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#3A52A6] flex items-center justify-between ${
                            field.value ? 'text-primary' : 'text-gray-400'
                          } ${errors.applicationDeadline ? 'border-[#EF4444]' : 'border-[#C4CBD5]'}`}
                        >
                          <span>
                            {field.value
                              ? field.value.toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Application deadline'}
                          </span>
                          <CalendarIcon className="h-4 w-4 opacity-60" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.applicationDeadline && (
                  <p className="text-xs text-[#EF4444] mt-1">{errors.applicationDeadline.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Criteria */}
          <div>
            <label className="block text-xs text-[#6B7280] mb-1.5 ml-0.5">
              Eligibility Criteria <span className="text-[#EF4444]">*</span>
            </label>
            <PresetPickerPopover
              presets={PRESET_CRITERIA}
              selectedItems={criteria}
              onSelect={addCriterionDirect}
              disabled={loading}
              hasError={!!errors.criterias}
              placeholder="Select eligibility criteria"
            />
            {errors.criterias && <p className="text-xs text-[#EF4444] mt-1">{errors.criterias.message}</p>}
            {criteria.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {criteria.map((criterion, index) => (
                  <span key={index} className="inline-flex items-center gap-2 px-3 py-2 border border-border bg-[#F9FAFB] text-primary text-xs rounded-md">
                    {criterion}
                    <button disabled={loading} onClick={() => removeCriterion(index)} className="cursor-pointer hover:text-[#2A4296]">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Required Documents */}
          <div>
            <label className="block text-xs text-[#6B7280] mb-1.5 ml-0.5">
              Required Documents <span className="text-[#EF4444]">*</span>
            </label>
            <PresetPickerPopover
              presets={PRESET_DOCUMENTS}
              selectedItems={requiredDocuments}
              onSelect={addDocumentDirect}
              disabled={loading}
              hasError={!!errors.requirements}
              placeholder="Select required documents"
            />
            {errors.requirements && <p className="text-xs text-[#EF4444] mt-1">{errors.requirements.message}</p>}
            {requiredDocuments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {requiredDocuments.map((doc, index) => (
                  <span key={index} className="inline-flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] text-[#374151] text-xs rounded-md border border-border">
                    {doc}
                    <button disabled={loading} onClick={() => removeDocument(index)} className="hover:text-[#2A4296]">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Custom Form Fields */}
          <div>
            <div className="mb-3">
              <label className="block text-sm text-[#4A5568] mb-1 ml-0.5">Application Form <span className="text-[#EF4444]">*</span></label>
              <p className="text-xs text-[#6B7280] ml-0.5">Add custom fields to collect information from applicants.</p>
            </div>

            <CustomFormFieldsList
              fields={customFormFields}
              onEdit={openCustomFormModal}
              onRemove={removeCustomFormField}
              disabled={loading}
            />

            <button
              type="button"
              disabled={loading}
              onClick={() => openCustomFormModal()}
              className={`w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed ${
                errors.formFields ? 'border-[#EF4444]' : 'border-[#3A52A6]'
              } bg-[#E0ECFF] text-secondary text-sm rounded-lg hover:bg-[#D0DCFF] transition-colors`}
            >
              <Plus size={20} />
              {customFormFields.length === 0 ? 'Add Form Field' : 'Add Another Field'}
            </button>
            {errors.formFields && <p className="text-xs text-[#EF4444] mt-1">{errors.formFields.message}</p>}
          </div>

          {/* Submit */}
          <button
          // @ts-expect-error it works but I get type error for some reason
            onClick={handleSubmit(onSubmit)}
            className={`w-full mt-2 mb-6 md:mb-0 py-3 bg-[#EFA508] text-tertiary cursor-pointer rounded-lg hover:bg-[#D89407] transition-colors ${
              loading && "opacity-60 cursor-not-allowed"
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </span>
            ) : (
              <span>Create Scholarship</span>
            )}
          </button>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:col-span-7 lg:top-6 h-fit md:ml-24">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm text-primary">Live Preview</h2>
          </div>
          
          <ScholarshipPreviewCard
            scholarship={previewScholarship}
            amountType={amountType}
            unlimitedSlots={unlimitedSlots}
            onClick={() => setShowFullPreview(true)}
          />
        </div>
      </div>

      <DescriptionModal
        isOpen={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        description={description || ''}
        onSave={handleSaveDescription}
      />

      <CustomFormFieldModal
        isOpen={showCustomFieldModal}
        onClose={() => {
          setShowCustomFieldModal(false);
          setEditingFieldIndex(null);
        }}
        onSave={handleSaveCustomField}
        editingField={editingFieldIndex !== null ? customFormFields[editingFieldIndex] : null}
      />

      {showFullPreview && (
        <ScholarshipFullPreviewModal
          scholarship={previewScholarship}
          onClose={() => setShowFullPreview(false)}
          isPreview={true}
        />
      )}

      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className='font-normal'>Create Scholarship</DialogTitle>
            <DialogDescription className="text-[#6B7280] font-normal">
              You're about to create <span className="text-primary">{title || 'this scholarship'}</span>. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setShowConfirmationModal(false)}
              disabled={loading}
              className="cursor-pointer px-4 py-2 rounded-lg border border-[#C4CBD5] text-primary text-sm hover:bg-[#F3F4F6] transition-colors"
            >
              Review
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={loading}
              className={`cursor-pointer px-4 py-2 rounded-lg bg-[#EFA508] text-tertiary text-sm hover:bg-[#D89407] transition-colors ${
                loading && "opacity-60 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </span>
              ) : (
                'Create'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
