import { useState } from "react";
import {
	Download,
	FileSpreadsheet,
	FileText,
	FileType,
	Loader2,
} from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	fetchAllUsers,
	exportUsers,
	type ExportFormat,
} from "@/lib/admin/export";
import type { UserListQuery } from "@/lib/admin/model";
import { toast } from "@/lib/toast";

interface ExportUsersMenuProps {
	filters: Pick<UserListQuery, "role" | "search" | "sortBy" | "sortOrder">;
}

const OPTIONS: {
	format: ExportFormat;
	label: string;
	icon: typeof FileText;
}[] = [
	{ format: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet },
	{ format: "csv", label: "CSV (.csv)", icon: FileText },
	{ format: "pdf", label: "PDF (.pdf)", icon: FileType },
];

export default function ExportUsersMenu({ filters }: ExportUsersMenuProps) {
	const [open, setOpen] = useState(false);
	const [exporting, setExporting] = useState<ExportFormat | null>(null);

	const handleExport = async (exportFormat: ExportFormat) => {
		setExporting(exportFormat);
		try {
			const users = await fetchAllUsers(filters);
			if (users.length === 0) {
				toast.info(
					"Nothing to export",
					"No users match the current filters",
					2500,
				);
				return;
			}
			await exportUsers(users, exportFormat);
			toast.success("Export ready", `${users.length} users exported`, 2500);
			setOpen(false);
		} catch (error) {
			toast.error(
				"Export failed",
				error instanceof Error ? error.message : "Could not export users",
			);
		} finally {
			setExporting(null);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3A52A6] px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#2F4390] focus:outline-none focus:ring-2 focus:ring-[#3A52A6] focus:ring-offset-2"
				>
					<Download className="h-4 w-4" />
					Export
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-52 rounded-xl border-[#D8E6FF] bg-white p-1.5"
			>
				<p className="px-2.5 pb-1 pt-1.5 text-[11px] uppercase tracking-[0.18em] text-[#8CA2D6]">
					Export as
				</p>
				{OPTIONS.map(({ format: optionFormat, label, icon: Icon }) => (
					<button
						key={optionFormat}
						type="button"
						disabled={exporting !== null}
						onClick={() => handleExport(optionFormat)}
						className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-primary transition-colors hover:bg-[#EEF5FF] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{exporting === optionFormat ? (
							<Loader2 className="h-4 w-4 animate-spin text-[#3A52A6]" />
						) : (
							<Icon className="h-4 w-4 text-[#3A52A6]" />
						)}
						{label}
					</button>
				))}
			</PopoverContent>
		</Popover>
	);
}
