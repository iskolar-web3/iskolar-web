import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';

/**
 * Props for the DescriptionModal component
 */
interface DescriptionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback function to close the modal */
  onClose: () => void;
  /** Current description text */
  description: string;
  /** Callback function when description is saved */
  onSave: (description: string) => void;
}

/**
 * Description modal component for editing scholarship descriptions
 * Provides a textarea for entering detailed scholarship information
 * @param props - Component props
 * @returns Modal dialog with textarea for description editing
 */
export default function DescriptionModal({
  isOpen,
  onClose,
  description,
  onSave,
}: DescriptionModalProps) {
  const [tempDescription, setTempDescription] = useState(description);

  useEffect(() => {
    setTempDescription(description);
  }, [description, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-tertiary border-0 py-4 px-6 max-w-lg" showCloseButton={true}>
        <DialogHeader>
          <h3 className="text-lg text-secondary">Scholarship Description</h3>
        </DialogHeader>
        <textarea
          value={tempDescription}
          onChange={(e) => setTempDescription(e.target.value)}
          placeholder="Add details like qualifications, background, or any special notes applicants should know before applying."
          className="w-full h-45 px-4 py-3 rounded-lg border border-[#C4CBD5] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3A52A6] resize-none"
        />
        <DialogFooter className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer py-2.5 border border-[#C4CBD5] rounded-lg text-sm text-[#4A5568] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(tempDescription);
              onClose();
            }}
            className="flex-1 cursor-pointer text-sm py-2.5 bg-[#3A52A6] text-tertiary rounded-lg hover:bg-[#2A4296] transition-colors"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

