import { Calendar, Users, Coins, Images, UserIcon } from 'lucide-react';
import { calculateAmountPerScholar, formatCurrency, formatDeadline } from '@/utils/formatting.utils';
import { ScholarshipType, type ScholarshipFormData } from '@/lib/scholarship/model';
import { useAuth } from '@/auth';
import type { AnySponsor } from '@/lib/sponsor/model';
import { getSponsorName } from '@/lib/sponsor/api';

/**
 * Props for the ScholarshipPreviewCard component
 */
interface ScholarshipPreviewCardProps {
  /** Partial scholarship data to display in preview */
  scholarship: Partial<ScholarshipFormData>;
  /** Optional callback when card is clicked */
  onClick?: () => void;
}

/**
 * Scholarship preview card component for sponsors
 * Displays a preview of scholarship information during creation/editing
 * @param props - Component props
 * @returns Preview card component with scholarship details
 */
export default function ScholarshipPreviewCard({ scholarship, onClick }: ScholarshipPreviewCardProps) {
  const amountPerScholar = calculateAmountPerScholar(scholarship.totalAmount, scholarship.totalSlots);
  const auth = useAuth<AnySponsor>()

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-xl overflow-hidden border border-[#D3DCF6] cursor-pointer transition-transform duration-200 hover:scale-98"
    >
      <div className="bg-[#3A52A6]">
        <div className="flex">
          {/* Image Section */}
          <div className="relative w-32 h-32 shrink-0">
            {scholarship.imageUrl ? (
              <img
                src={scholarship.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center">
                <Images className="text-tertiary/60" size={32} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-tertiary px-4 py-2">
            <h3 className="text-xl mb-1 line-clamp-1">
              {scholarship.name || 'Scholarship Title'}
            </h3>

            {scholarship.scholarshipType && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-white/90 text-secondary text-[11px] rounded">
                  {scholarship.scholarshipType === ScholarshipType.NeedBased
                    ? 'Need-Based'
                    : scholarship.scholarshipType === ScholarshipType.MeritBased
                    ? 'Merit-Based'
                    : 'Combined'}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs mb-1.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                {auth.profile.avatarUrl ? (
                  <img
                    src={auth.profile.avatarUrl}
                    alt={getSponsorName(auth.profile)}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-full h-full" />
                )}
              </div>
              <span>{getSponsorName(auth.profile) || 'iSkolar'}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Calendar size={16} />
              <span>
                {formatDeadline(scholarship.applicationDeadline)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-2">
        {/* Amount & Slots */}
        <div className="grid grid-cols-2 gap-2 mt-2 mb-4">
          <div className="bg-[#F9FAFB] border border-border rounded-lg p-3">
            <div className="flex items-center gap-1 text-[#6B7280] text-sm mb-1">
              <Coins size={16} />
              <span>Amount</span>
            </div>
            <p className="text-base text-primary">
              {amountPerScholar !== null
                ? formatCurrency(amountPerScholar, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    showSpace: true,
                  })
                : scholarship.totalAmount
                ? formatCurrency(scholarship.totalAmount, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '₱0.00'}
            </p>
            <p className="text-xs text-[#6B7280]">per scholar</p>
          </div>

          <div className="bg-[#F9FAFB] border border-border rounded-lg p-3">
            <div className="flex items-center gap-1 text-[#6B7280] text-sm mb-1">
              <Users size={16} />
              <span>Slots</span>
            </div>
            <p className="text-base text-primary">{scholarship.totalSlots || '0'}</p>
            <p className="text-xs text-[#6B7280]">scholars</p>
          </div>
        </div>

        {/* Criteria and Required Documents */}
        <div className="mt-2 grid grid-cols-2 gap-8 text-sm">
          <div>
            <h4 className="text-[#4B5563] text-xs tracking-wider mb-2">Criteria</h4>
            {scholarship.criterias && scholarship.criterias.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {scholarship.criterias.slice(0, 2).map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-[#F9FAFB] text-[#374151] text-[11px] rounded border border-border"
                  >
                    {c}
                  </span>
                ))}
                {scholarship.criterias.length > 2 && (
                  <span className="px-2.5 py-1 bg-[#F9FAFB] text-[#374151] text-[11px] rounded border border-border">
                    +{scholarship.criterias.length - 2} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[#9CA3AF] text-xs">No criteria added</p>
            )}
          </div>

          <div>
            <h4 className="text-[#4B5563] text-xs tracking-wider mb-2">Required Documents</h4>
            {scholarship.requirements && scholarship.requirements.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {scholarship.requirements.slice(0, 2).map((d, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-[#F9FAFB] text-[#374151] text-[11px] rounded border border-border"
                  >
                    {d}
                  </span>
                ))}
                {scholarship.requirements.length > 2 && (
                  <span className="px-2.5 py-1 bg-[#F9FAFB] text-[#374151] text-[11px] rounded border border-border">
                    +{scholarship.requirements.length - 2} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[#9CA3AF] text-xs">No documents added</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
