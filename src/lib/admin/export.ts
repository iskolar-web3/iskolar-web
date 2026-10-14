import { format } from "date-fns";
import { getUsers } from "./api";
import type { UserListItem, UserListQuery } from "./model";

export type ExportFormat = "xlsx" | "csv" | "pdf";

const PAGE_SIZE = 100;
const MAX_PAGES = 500;

const HEADERS = [
	"Email",
	"Role",
	"Status",
	"Signup Date",
	"Last Activity",
] as const;

function formatDate(value: string): string {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "" : format(date, "yyyy-MM-dd HH:mm");
}

function toRows(users: UserListItem[]): string[][] {
	return users.map((user) => [
		user.email,
		user.roleName ?? "No role",
		user.statusName,
		formatDate(user.createdAt),
		formatDate(user.lastLoginAt),
	]);
}

// Stops spreadsheet apps from running cell values that look like formulas
function neutralizeFormula(value: string): string {
	return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export async function fetchAllUsers(
	filters: Pick<UserListQuery, "role" | "search" | "sortBy" | "sortOrder">,
): Promise<UserListItem[]> {
	const users: UserListItem[] = [];
	let page = 1;
	let totalPages = 1;

	do {
		const res = await getUsers({ ...filters, page, limit: PAGE_SIZE });
		if (!res.data) throw new Error("Failed to load users");
		users.push(...res.data.items);
		totalPages = res.data.totalPages;
		page += 1;
	} while (page <= totalPages && page <= MAX_PAGES);

	return users;
}

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

function exportCsv(rows: string[][], filename: string) {
	const quote = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
	const lines = [
		HEADERS.map(quote).join(","),
		...rows.map((row) =>
			row.map((cell) => quote(neutralizeFormula(cell))).join(","),
		),
	];
	// BOM so Excel reads UTF-8 correctly
	const blob = new Blob([`﻿${lines.join("\r\n")}`], {
		type: "text/csv;charset=utf-8;",
	});
	downloadBlob(blob, filename);
}

async function exportXlsx(rows: string[][], filename: string) {
	const { default: ExcelJS } = await import("exceljs");
	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet("Users");

	sheet.columns = [
		{ header: HEADERS[0], width: 40 },
		{ header: HEADERS[1], width: 14 },
		{ header: HEADERS[2], width: 14 },
		{ header: HEADERS[3], width: 20 },
		{ header: HEADERS[4], width: 20 },
	];
	for (const row of rows) {
		sheet.addRow(row.map(neutralizeFormula));
	}

	const header = sheet.getRow(1);
	header.font = { bold: true, color: { argb: "FFFFFFFF" } };
	header.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FF3A52A6" },
	};
	sheet.views = [{ state: "frozen", ySplit: 1 }];

	const buffer = await workbook.xlsx.writeBuffer();
	downloadBlob(
		new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		}),
		filename,
	);
}

async function exportPdf(rows: string[][], filename: string) {
	const [{ jsPDF }, { default: autoTable }] = await Promise.all([
		import("jspdf"),
		import("jspdf-autotable"),
	]);
	const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

	doc.setFontSize(16);
	doc.setTextColor(58, 82, 166);
	doc.text("iSkolar User Directory", 40, 40);
	doc.setFontSize(9);
	doc.setTextColor(107, 114, 128);
	doc.text(
		`Generated ${format(new Date(), "MMM d, yyyy p")}  |  ${rows.length} users`,
		40,
		56,
	);

	autoTable(doc, {
		head: [[...HEADERS]],
		body: rows,
		startY: 70,
		styles: { fontSize: 9, cellPadding: 5 },
		headStyles: { fillColor: [58, 82, 166], textColor: 255 },
		alternateRowStyles: { fillColor: [247, 250, 255] },
		didDrawPage: () => {
			const pageNumber = doc.getNumberOfPages();
			doc.setFontSize(8);
			doc.setTextColor(156, 163, 175);
			doc.text(
				`Page ${pageNumber}`,
				doc.internal.pageSize.getWidth() - 70,
				doc.internal.pageSize.getHeight() - 20,
			);
		},
	});

	doc.save(filename);
}

export async function exportUsers(
	users: UserListItem[],
	exportFormat: ExportFormat,
): Promise<void> {
	const rows = toRows(users);
	const base = `iskolar-users-${format(new Date(), "yyyy-MM-dd")}`;

	switch (exportFormat) {
		case "csv":
			return exportCsv(rows, `${base}.csv`);
		case "xlsx":
			return exportXlsx(rows, `${base}.xlsx`);
		case "pdf":
			return exportPdf(rows, `${base}.pdf`);
	}
}
