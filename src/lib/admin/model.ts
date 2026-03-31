export type DashboardMetrics = {
	totalUsers: number;
	studentCount: number;
	sponsorCount: number;
	adminCount: number;
	sponsorToStudentRatio: number;
	activeUsersLast7Days: number;
	signupsLast7Days: number;
};

export type SignupTimelineEntry = {
	date: string;
	count: number;
};

export type UserListItem = {
	id: string;
	email: string;
	avatarUrl: string | null;
	roleName: string | null;
	roleCode: string | null;
	statusName: string;
	statusCode: string;
	createdAt: string;
	lastLoginAt: string;
};

export type PaginatedResponse<T> = {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type UserListQuery = {
	page?: number;
	limit?: number;
	role?: "student" | "sponsor" | "admin";
	search?: string;
	sortBy?: "email" | "created_at" | "last_login_at";
	sortOrder?: "asc" | "desc";
};
