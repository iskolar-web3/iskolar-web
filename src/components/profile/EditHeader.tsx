import { Edit, X, Save, Plus } from 'lucide-react';
import type { JSX } from 'react';

/**
 * Props for the EditHeader component
 */
interface EditHeaderProps {
  /** Title text to display in the header */
  title: string;
  /** Whether the component is in edit mode */
  isEditing: boolean;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** When true, shows an "Add" button instead of the edit icon */
  isEmpty?: boolean;
  /** Callback function when edit button is clicked */
  onEdit: () => void;
  /** Callback function when cancel button is clicked */
  onCancel: () => void;
  /** Callback function when save button is clicked */
  onSave: () => void;
}

/**
 * EditHeader component for profile sections
 * Displays title with edit, cancel, and save action buttons
 * @param props - Component props
 * @returns Edit header component with action buttons
 */
export default function EditHeader({ title, isEditing, isSaving, isEmpty, onEdit, onCancel, onSave }: EditHeaderProps): JSX.Element {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base md:text-lg text-primary">{title}</h3>
      {!isEditing ? (
        isEmpty ? (
          <button onClick={onEdit} className="px-3 py-2 bg-[#3A52A6] hover:bg-[#2f4389] text-white rounded-sm flex items-center gap-2 transition-colors cursor-pointer text-xs font-medium">
            <Plus className="h-3 w-3 md:w-4 md:h-4" />
            Add
          </button>
        ) : (
          <button onClick={onEdit} className="px-2 py-2 bg-[#3A52A6] hover:bg-[#2f4389] text-white rounded-sm flex items-center gap-2 transition-colors cursor-pointer text-xs">
            <Edit className="h-3 w-3 md:w-4 md:h-4" />
          </button>
        )
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={onCancel} disabled={isSaving} className="px-3 py-2 bg-[#F0F7FF] border border-[#D1D5DB] hover:bg-[#D9E9FF] text-primary rounded-md flex items-center gap-1 transition-colors cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed">
            <X className="h-3 w-3 md:w-4 md:h-4" />
            Cancel
          </button>
          <button onClick={onSave} disabled={isSaving} className="px-3 py-2 bg-[#efa508] hover:bg-[#D89407] text-tertiary rounded-md flex items-center gap-2 transition-colors cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-3 w-3 md:w-4 md:h-4" />}
            Save
          </button>
        </div>
      )}
    </div>
  );
}