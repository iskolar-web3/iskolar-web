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
import { useScholarshipForm } from '@/hooks/useScholarshipForm';
import { useScholarshipPreview } from '@/hooks/useScholarshipPreview';
import { useToast } from '@/hooks/useToast';
import { usePageTitle } from "@/hooks/usePageTitle";
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
  usePageTitle('Create');

  const auth = useAuth<AnySponsor>()
  const {
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

  const criteria = watch('criterias');
  const requiredDocuments = watch('requirements');
  const customFormFields = watch('formFields') || [];
  const description = watch('description');
  const title = watch('name');
  const totalAmount = watch('totalAmount');
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
    setLoading(true);
    const amountPayload: Partial<ScholarshipFormData> =
      amountType === 'fixed'
        ? { totalAmountMin: undefined, totalAmountMax: undefined }
        : amountType === 'range'
        ? { totalAmount: undefined }
        : { totalAmount: undefined, totalAmountMin: undefined, totalAmountMax: undefined };
    const slotsPayload = unlimitedSlots ? { totalSlots: undefined } : {};
    mutation.mutate({ ...data, ...amountPayload, ...slotsPayload } as ScholarshipFormData);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {toast && <Toast {...toast} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Scholarship Details */}
        <div className="space-y-4">
          {/* Type and Purpose */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select 
                value={scholarshipType} 
                onValueChange={(value) => setValue('scholarshipType', value as ScholarshipType, { shouldValidate: true })}
              >
                <SelectTrigger disabled={loading} className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all data-[placeholder]:text-gray-400 ${
                  errors.scholarshipType
                    ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444] text-primary'
                    : 'border-gray-300 focus:border-[#3A52A6] focus:ring-[#3A52A6]/20 text-primary'
                }`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ScholarshipType.NeedBased}>Need-Based</SelectItem>
                  <SelectItem value={ScholarshipType.MeritBased}>Merit-Based</SelectItem>
                  <SelectItem value={ScholarshipType.Combined}>Combined</SelectItem>
                </SelectContent>
              </Select>
              {errors.scholarshipType && <p className="text-xs text-[#EF4444] mt-1">{errors.scholarshipType.message}</p>}
            </div>

          </div>

          <div className="bg-[#F8F9FC] rounded-xl p-3 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Image Upload */}
              <div className="md:w-[218px]">
                <label className="block">
                  {imagePreview ? (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden">
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
                    <div className={`border-2 border-dashed ${
                      errors.imageUrl ? 'border-[#EF4444]' : 'border-[#3A52A6]'
                    } rounded-lg text-center cursor-pointer hover:bg-[#F0F7FF] transition-colors flex flex-col items-center justify-center w-full aspect-square px-4`}>
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
                {errors.imageUrl && <p className="text-xs text-[#EF4444] mt-1">{errors.imageUrl.message}</p>}
              </div>

              <div className="md:w-2/3 space-y-3.5">
                {/* Title */}
                <div>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Scholarship Title"
                        disabled={loading}
                        className={`w-full text-2xl border-b-2 ${
                          errors.name ? 'border-[#EF4444]' : 'border-transparent'
                        } bg-transparent pb-2 focus:outline-none focus:border-[#3A52A6] text-primary`}
                      />
                    )}
                  />
                  {errors.name && <p className="text-xs text-[#EF4444] mt-1">{errors.name.message}</p>}
                </div>

                {/* Description */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowDescriptionModal(true)}
                  className="w-full cursor-pointer flex items-center gap-2 px-4 py-3 rounded-lg bg-[#F3F4F6] border text-[#6B7280] text-sm hover:bg-muted transition-colors"
                >
                  <span className="text-[#8B9CB5]">☰</span>
                  {description ? 'Edit Description' : 'Add Description'}
                </button>

                {/* Total Amount & Slot */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex rounded-lg overflow-hidden border border-[#C4CBD5] mb-1.5 text-xs">
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
                          className={`flex-1 py-1.5 capitalize transition-colors ${amountType === t ? 'bg-[#3A52A6] text-white' : 'bg-[#F8F9FC] text-[#6B7280] hover:bg-gray-100'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {amountType === 'fixed' && (
                      <Controller
                        control={control}
                        name="totalAmount"
                        render={({ field }) => (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">₱</span>
                            <input
                              {...field}
                              type="number"
                              disabled={loading}
                              placeholder="0.00"
                              className={`w-full pl-7 pr-4 py-3 rounded-lg border ${
                                errors.totalAmount ? 'border-[#EF4444]' : 'border-[#C4CBD5]'
                              } bg-[#F8F9FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
                            />
                          </div>
                        )}
                      />
                    )}
                    {amountType === 'varies' && (
                      <p className="text-xs text-[#6B7280] px-1 py-2">Amount varies — describe it in the description field.</p>
                    )}
                    {amountType === 'range' && (
                      <div className="flex items-center gap-2">
                        <Controller
                          control={control}
                          name="totalAmountMin"
                          render={({ field }) => (
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">₱</span>
                              <input
                                {...field}
                                type="number"
                                disabled={loading}
                                placeholder="Min"
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
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">₱</span>
                              <input
                                {...field}
                                type="number"
                                disabled={loading}
                                placeholder="Max"
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
                    {!unlimitedSlots && (
                      <Controller
                        control={control}
                        name="totalSlots"
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            disabled={loading}
                            placeholder="Total slots"
                            className={`w-full px-4 py-3 rounded-lg border ${
                              errors.totalSlots ? 'border-[#EF4444]' : 'border-[#C4CBD5]'
                            } bg-[#F8F9FC] text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
                          />
                        )}
                      />
                    )}
                    {unlimitedSlots && (
                      <div className="w-full px-4 py-3 rounded-lg border border-[#C4CBD5] bg-[#F8F9FC] text-sm text-[#6B7280]">
                        Unlimited
                      </div>
                    )}
                    <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
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
                        className="w-3.5 h-3.5 accent-[#3A52A6]"
                      />
                      <span className="text-xs text-[#6B7280]">Unlimited</span>
                    </label>
                    {errors.totalSlots && <p className="text-xs text-[#EF4444] mt-1">{errors.totalSlots.message}</p>}
                  </div>
                </div>

                {/* Application Deadline */}
                <div>
                  <Controller
                    control={control}
                    name="applicationDeadline"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            disabled={loading}
                            className={`w-full px-4 py-3 text-sm border rounded-lg bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#3A52A6] flex items-center justify-between ${
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
                  {errors.applicationDeadline && <p className="text-xs text-[#EF4444] mt-1">{errors.applicationDeadline.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Criteria */}
          <div>
            <div className="flex gap-2">
              <input
                value={criteriaInput}
                disabled={loading}
                onChange={(e) => setCriteriaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCriterion())}
                placeholder="Enter eligibility criterion"
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  errors.criterias ? 'border-[#EF4444]' : 'border-[#C4CBD5]'
                } bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
              />
              <button
                type="button"
                disabled={loading}
                onClick={addCriterion}
                className="w-11 h-11 bg-[#3A52A6] text-tertiary rounded-lg flex items-center justify-center hover:bg-[#2A4296] transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
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
            <div className="flex gap-2">
              <input
                value={documentsInput}
                disabled={loading}
                onChange={(e) => setDocumentsInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
                placeholder="Enter required document"
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  errors.requirements ? 'border-[#EF4444]' : 'border-[#C4CBD5]'
                } bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6]`}
              />
              <button
                type="button"
                disabled={loading}
                onClick={addDocument}
                className="w-11 h-11 bg-[#3A52A6] text-tertiary rounded-lg flex items-center justify-center hover:bg-[#2A4296] transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            {errors.requirements && <p className="text-xs text-[#EF4444] mt-1">{errors.requirements.message}</p>}
            {requiredDocuments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {requiredDocuments.map((doc, index) => (
                  <span key={index} className="inline-flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] text-[#374151] text-xs rounded-md border border-border rounded-lg">
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
              <label className="block text-sm text-[#4A5568] mb-1 ml-0.5">Application Form</label>
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
        <div className="lg:sticky lg:top-6 h-fit md:ml-24">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm text-primary">Live Preview</h2>
          </div>
          
          <ScholarshipPreviewCard 
            scholarship={previewScholarship}
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
    </div>
  );
}
