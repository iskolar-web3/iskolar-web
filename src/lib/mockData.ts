// =============================================================================
// MOCK DATA FOR LANDING PAGE SCREENSHOTS  — SAFE TO DELETE
// -----------------------------------------------------------------------------
// This file seeds the Discover, Scholarships, Applicants, and Scholars pages
// with realistic placeholder records so the system can be screenshotted with
// believable values for the marketing landing page.
//
// HOW TO REMOVE EVERYTHING:
//   1. Delete this file (src/lib/mockData.ts).
//   2. In src/lib/scholarship/api.ts, delete the three blocks marked
//      "MOCK DATA START" ... "MOCK DATA END" (and the import of this file).
//
// HOW TO TURN OFF WITHOUT DELETING:
//   Set MOCK_DATA_ENABLED to false below.
// =============================================================================

import { type Disbursement, DisbursementStatus } from "./disbursement/model";
import {
	type Applicant,
	type Application,
	type Scholarship,
	ScholarshipApplicationStatus,
	ScholarshipStatus,
	ScholarshipType,
} from "./scholarship/model";
import {
	AgencyType,
	type AnySponsor,
	type GovernmentSponsor,
	type OrganizationSponsor,
	OrganizationType,
	SponsorType,
} from "./sponsor/model";
import {
	EducationLevel,
	Gender,
	PaymentMethod,
	type Student,
} from "./student/model";
import { ContactType } from "./user/model";

/** Master switch. Set to false to disable all mock data. */
export const MOCK_DATA_ENABLED = true;

const uuid = () => crypto.randomUUID();

const phone = (value: string) => ({
	id: uuid(),
	name: "Phone",
	code: ContactType.Phone,
	value,
});

// --- Sponsors ----------------------------------------------------------------

const organization = (
	name: string,
	email: string,
	orgType: OrganizationType,
	orgTypeName: string,
): OrganizationSponsor => ({
	id: uuid(),
	userId: uuid(),
	email,
	name,
	organizationType: { id: 1, name: orgTypeName, code: orgType },
	contact: phone("+639171234567"),
	sponsorType: { id: 2, name: "Organization", code: SponsorType.Organization },
	avatarUrl: null,
});

const government = (
	name: string,
	email: string,
	agencyType: AgencyType,
	agencyTypeName: string,
): GovernmentSponsor => ({
	id: uuid(),
	userId: uuid(),
	email,
	name,
	agencyType: { id: 1, name: agencyTypeName, code: agencyType },
	contact: phone("+63288765432"),
	sponsorType: { id: 3, name: "Government", code: SponsorType.Government },
	avatarUrl: null,
});

const makatiCares = organization(
	"Makati Cares Foundation",
	"scholarships@makaticares.org",
	OrganizationType.NonGovernmentalOrganization,
	"Non Governmental Organization",
);
const qbo = organization(
	"QBO Innovation Hub",
	"grants@qbo.com.ph",
	OrganizationType.PrivateCompany,
	"Private Company",
);
const dost = government(
	"Department of Science and Technology",
	"scholarships@dost.gov.ph",
	AgencyType.NationalGovernmentAgency,
	"National Government Agency",
);
const umak = organization(
	"University of Makati",
	"scholarships@umak.edu.ph",
	OrganizationType.EducationalInstitution,
	"Educational Institution",
);
const connectedWomen = organization(
	"Connected Women PH",
	"fellowship@connectedwomen.ph",
	OrganizationType.NonGovernmentalOrganization,
	"Non Governmental Organization",
);
const gawadKalinga = organization(
	"Gawad Kalinga",
	"education@gk1world.com",
	OrganizationType.NonGovernmentalOrganization,
	"Non Governmental Organization",
);

// --- Students ----------------------------------------------------------------

const student = (
	firstName: string,
	lastName: string,
	email: string,
	schoolName: string,
	gender: Gender,
	contactValue: string,
): Student => ({
	id: uuid(),
	userId: uuid(),
	firstName,
	middleName: null,
	lastName,
	birthDate: new Date("2004-06-15"),
	gender: {
		id: gender === Gender.Male ? 1 : 2,
		name: gender === Gender.Male ? "Male" : "Female",
		code: gender,
	},
	school: null,
	educationLevel: {
		id: 2,
		name: "Tertiary Education",
		code: EducationLevel.Tertiary,
	},
	schoolName,
	contact: phone(contactValue),
	avatarUrl: null,
	email,
});

const maria = student(
	"Maria",
	"Santos",
	"maria.santos@umak.edu.ph",
	"University of Makati",
	Gender.Female,
	"+639051234567",
);
const juan = student(
	"Juan",
	"dela Cruz",
	"juan.delacruz@pup.edu.ph",
	"Polytechnic University of the Philippines",
	Gender.Male,
	"+639061234567",
);
const andrea = student(
	"Andrea",
	"Reyes",
	"andrea.reyes@up.edu.ph",
	"University of the Philippines Diliman",
	Gender.Female,
	"+639071234567",
);
const miguel = student(
	"Miguel",
	"Garcia",
	"miguel.garcia@dlsu.edu.ph",
	"De La Salle University",
	Gender.Male,
	"+639081234567",
);
const sofia = student(
	"Sofia",
	"Mendoza",
	"sofia.mendoza@ateneo.edu",
	"Ateneo de Manila University",
	Gender.Female,
	"+639091234567",
);
const gabriel = student(
	"Gabriel",
	"Tan",
	"gabriel.tan@mapua.edu.ph",
	"Mapua University",
	Gender.Male,
	"+639101234567",
);
const isabella = student(
	"Isabella",
	"Ramos",
	"isabella.ramos@ust.edu.ph",
	"University of Santo Tomas",
	Gender.Female,
	"+639111234567",
);
const rafael = student(
	"Rafael",
	"Bautista",
	"rafael.bautista@feu.edu.ph",
	"Far Eastern University",
	Gender.Male,
	"+639121234567",
);
const camille = student(
	"Camille",
	"Villanueva",
	"camille.villanueva@umak.edu.ph",
	"University of Makati",
	Gender.Female,
	"+639131234567",
);
const nathaniel = student(
	"Nathaniel",
	"Cruz",
	"nathaniel.cruz@tip.edu.ph",
	"Technological Institute of the Philippines",
	Gender.Male,
	"+639141234567",
);
const patricia = student(
	"Patricia",
	"Flores",
	"patricia.flores@plm.edu.ph",
	"Pamantasan ng Lungsod ng Maynila",
	Gender.Female,
	"+639151234567",
);
const joshua = student(
	"Joshua",
	"Aquino",
	"joshua.aquino@ue.edu.ph",
	"University of the East",
	Gender.Male,
	"+639161234567",
);

// --- Scholarships ------------------------------------------------------------

const typeDetail = (code: ScholarshipType, name: string) => ({
	id: 1,
	name,
	code,
});
const activeStatus = { id: 2, name: "Active", code: ScholarshipStatus.Active };

const baseScholarship = (
	id: string,
	name: string,
	description: string,
	scholarshipType: ReturnType<typeof typeDetail>,
	sponsor: AnySponsor,
	cardColor: string,
	amounts: {
		totalAmount?: number | null;
		totalAmountMin?: number | null;
		totalAmountMax?: number | null;
	},
	totalSlots: number,
	applicationCount: number,
	deadline: string,
	criterias: string[],
	requirements: string[],
): Scholarship => ({
	id,
	createdAt: new Date("2026-04-01"),
	updatedAt: new Date("2026-05-10"),
	name,
	description,
	scholarshipType,
	status: activeStatus,
	totalAmount: amounts.totalAmount ?? null,
	totalAmountMin: amounts.totalAmountMin ?? null,
	totalAmountMax: amounts.totalAmountMax ?? null,
	totalSlots,
	applicationDeadline: new Date(deadline),
	imageUrl: null,
	cardColor,
	criterias,
	requirements,
	sponsor,
	formFields: [],
	applicationCount,
});

const SCH1 = uuid();
const SCH2 = uuid();
const SCH3 = uuid();
const SCH4 = uuid();
const SCH5 = uuid();
const SCH6 = uuid();

export const mockScholarships: Scholarship[] = [
	baseScholarship(
		SCH1,
		"Makati Future Leaders Scholarship",
		"Full tuition assistance for Makati residents who excel academically and show strong community leadership.",
		typeDetail(ScholarshipType.MeritBased, "Merit Based"),
		makatiCares,
		"#3A52A6",
		{ totalAmount: 50000 },
		25,
		48,
		"2026-08-30",
		[
			"Resident of Makati City",
			"General weighted average of 90 or above",
			"Enrolled in a four year degree program",
		],
		[
			"Certificate of enrollment",
			"Latest report card",
			"Barangay certificate of residency",
		],
	),
	baseScholarship(
		SCH2,
		"TechForward Engineering Grant",
		"Support for promising engineering and computer science students building the future of Philippine technology.",
		typeDetail(ScholarshipType.MeritBased, "Merit Based"),
		qbo,
		"#1D4ED8",
		{ totalAmountMin: 30000, totalAmountMax: 60000 },
		15,
		27,
		"2026-09-15",
		[
			"Taking up an engineering or computing degree",
			"At least second year standing",
			"No failing grades in the previous term",
		],
		[
			"Certificate of grades",
			"Portfolio or sample project",
			"Recommendation letter",
		],
	),
	baseScholarship(
		SCH3,
		"Iskolar ng Bayan STEM Fund",
		"Financial aid for talented students from low income families pursuing science, technology, engineering, and mathematics.",
		typeDetail(ScholarshipType.NeedBased, "Need Based"),
		dost,
		"#1E3A8A",
		{ totalAmount: 40000 },
		50,
		63,
		"2026-07-31",
		[
			"Combined family income below the regional threshold",
			"Enrolled in a STEM program",
			"Filipino citizen",
		],
		[
			"Income tax return or certificate of indigency",
			"Certificate of enrollment",
			"Birth certificate",
		],
	),
	baseScholarship(
		SCH4,
		"Bright Minds Merit Scholarship",
		"Recognizing students who combine academic excellence with genuine financial need across all colleges.",
		typeDetail(ScholarshipType.Combined, "Combined"),
		umak,
		"#2563EB",
		{ totalAmount: null },
		20,
		35,
		"2026-08-10",
		["General weighted average of 88 or above", "Demonstrated financial need"],
		[
			"Latest report card",
			"Statement of family income",
			"Essay on career goals",
		],
	),
	baseScholarship(
		SCH5,
		"Women in Technology Fellowship",
		"Empowering young women to pursue careers in software, data, and digital innovation.",
		typeDetail(ScholarshipType.MeritBased, "Merit Based"),
		connectedWomen,
		"#1E40AF",
		{ totalAmount: 45000 },
		10,
		19,
		"2026-09-30",
		[
			"Identifies as a woman in a technology program",
			"Active in a student organization",
		],
		[
			"Certificate of enrollment",
			"Personal statement",
			"Recommendation letter",
		],
	),
	baseScholarship(
		SCH6,
		"Community Builders Assistance",
		"Helping students from partner communities stay in school and finish their degrees with dignity.",
		typeDetail(ScholarshipType.NeedBased, "Need Based"),
		gawadKalinga,
		"#3B5BDB",
		{ totalAmountMin: 20000, totalAmountMax: 35000 },
		40,
		41,
		"2026-08-20",
		["Member of a partner community", "Maintains good academic standing"],
		[
			"Certificate of community membership",
			"Certificate of enrollment",
			"Latest report card",
		],
	),
];

// --- Applicants (also drive the Scholars page via approved/granted) -----------

const statusDetail = (code: ScholarshipApplicationStatus) => {
	const names: Record<
		ScholarshipApplicationStatus,
		{ id: number; name: string }
	> = {
		[ScholarshipApplicationStatus.Pending]: { id: 1, name: "Pending" },
		[ScholarshipApplicationStatus.Shortlisted]: { id: 2, name: "Shortlisted" },
		[ScholarshipApplicationStatus.Approved]: { id: 3, name: "Approved" },
		[ScholarshipApplicationStatus.Denied]: { id: 4, name: "Denied" },
		[ScholarshipApplicationStatus.Granted]: { id: 5, name: "Granted" },
	};
	return { ...names[code], code };
};

const applicant = (
	studentRecord: Student,
	code: ScholarshipApplicationStatus,
	createdAt: string,
	updatedAt: string,
): Applicant => ({
	id: uuid(),
	createdAt: new Date(createdAt),
	updatedAt: new Date(updatedAt),
	status: statusDetail(code),
	remarks: null,
	formFieldAnswers: [],
	student: studentRecord,
});

const S = ScholarshipApplicationStatus;

const mockApplicantsByScholarship: Record<string, Applicant[]> = {
	[SCH1]: [
		applicant(maria, S.Granted, "2026-05-12T09:30:00", "2026-05-25T14:00:00"),
		applicant(
			camille,
			S.Approved,
			"2026-05-14T10:15:00",
			"2026-05-26T11:20:00",
		),
		applicant(
			juan,
			S.Shortlisted,
			"2026-05-16T08:45:00",
			"2026-05-20T16:00:00",
		),
		applicant(andrea, S.Pending, "2026-05-18T13:05:00", "2026-05-18T13:05:00"),
		applicant(miguel, S.Pending, "2026-05-19T15:40:00", "2026-05-19T15:40:00"),
		applicant(rafael, S.Denied, "2026-05-13T11:10:00", "2026-05-21T09:30:00"),
	],
	[SCH2]: [
		applicant(gabriel, S.Granted, "2026-05-10T09:00:00", "2026-05-24T10:00:00"),
		applicant(
			nathaniel,
			S.Approved,
			"2026-05-12T14:25:00",
			"2026-05-25T15:30:00",
		),
		applicant(
			joshua,
			S.Shortlisted,
			"2026-05-15T10:50:00",
			"2026-05-22T12:10:00",
		),
		applicant(miguel, S.Pending, "2026-05-17T16:30:00", "2026-05-17T16:30:00"),
	],
	[SCH3]: [
		applicant(andrea, S.Granted, "2026-05-08T08:20:00", "2026-05-23T11:00:00"),
		applicant(
			isabella,
			S.Approved,
			"2026-05-11T09:40:00",
			"2026-05-24T13:45:00",
		),
		applicant(
			patricia,
			S.Pending,
			"2026-05-16T14:00:00",
			"2026-05-16T14:00:00",
		),
	],
	[SCH4]: [
		applicant(sofia, S.Approved, "2026-05-09T10:30:00", "2026-05-22T16:20:00"),
		applicant(
			isabella,
			S.Granted,
			"2026-05-10T11:15:00",
			"2026-05-23T09:50:00",
		),
	],
	[SCH5]: [
		applicant(
			patricia,
			S.Granted,
			"2026-05-07T09:10:00",
			"2026-05-21T10:40:00",
		),
		applicant(
			camille,
			S.Shortlisted,
			"2026-05-13T15:25:00",
			"2026-05-19T11:30:00",
		),
	],
	[SCH6]: [
		applicant(joshua, S.Granted, "2026-05-06T08:50:00", "2026-05-20T14:15:00"),
		applicant(rafael, S.Approved, "2026-05-09T13:35:00", "2026-05-22T10:05:00"),
	],
};

/** Returns mock applicants for a given scholarship id, or [] if not a mock id. */
export const getMockApplicants = (scholarshipId: string): Applicant[] =>
	mockApplicantsByScholarship[scholarshipId] ?? [];

/** Returns a mock scholarship by id, or undefined if not a mock id. */
export const getMockScholarshipById = (id: string): Scholarship | undefined =>
	mockScholarships.find((s) => s.id === id);

// --- Student applications (Home page) ----------------------------------------
// Each application reuses one of the mock scholarships above so the cards match
// what the student sees on the Discover page.

const application = (
	scholarship: Scholarship,
	code: ScholarshipApplicationStatus,
	createdAt: string,
	updatedAt: string,
): Application => ({
	scholarship,
	application: {
		id: uuid(),
		createdAt: new Date(createdAt),
		updatedAt: new Date(updatedAt),
		status: statusDetail(code),
		remarks: null,
		formFieldAnswers: [],
	},
});

const mockApplications: Application[] = [
	application(
		mockScholarships[0],
		S.Granted,
		"2026-05-12T09:30:00",
		"2026-05-25T14:00:00",
	),
	application(
		mockScholarships[3],
		S.Approved,
		"2026-05-15T10:20:00",
		"2026-05-26T11:00:00",
	),
	application(
		mockScholarships[1],
		S.Shortlisted,
		"2026-05-18T08:45:00",
		"2026-05-23T16:30:00",
	),
	application(
		mockScholarships[2],
		S.Pending,
		"2026-05-21T13:05:00",
		"2026-05-21T13:05:00",
	),
	application(
		mockScholarships[4],
		S.Pending,
		"2026-05-23T15:40:00",
		"2026-05-23T15:40:00",
	),
	application(
		mockScholarships[5],
		S.Denied,
		"2026-05-13T11:10:00",
		"2026-05-22T09:30:00",
	),
];

/**
 * Returns mock applications for the student Home page, filtered by the same
 * comma separated status string the backend expects ("" means all).
 */
export const getMockApplications = (status: string): Application[] => {
	if (!status) return mockApplications;
	const codes = status.split(",");
	return mockApplications.filter((a) =>
		codes.includes(a.application.status.code),
	);
};

// --- Student disbursements (My Funds page) -----------------------------------
// A proof image that actually exists in /public so received cards render cleanly.
const PROOF_IMAGE = "/scholarship-banner-placeholder.png";

const disbursement = (
	scholarshipName: string,
	amount: number,
	status: DisbursementStatus,
	method: PaymentMethod,
	methodName: string,
	accountName: string,
	accountNumber: string,
	dates: { sentAt?: string; receivedAt?: string },
	notes: { sponsorNote?: string; studentNote?: string },
): Disbursement => ({
	id: uuid(),
	createdAt: new Date("2026-05-20T09:00:00"),
	updatedAt: new Date("2026-05-28T09:00:00"),
	scholarshipApplicationId: uuid(),
	sponsorId: uuid(),
	studentId: uuid(),
	amount,
	status,
	sponsorNote: notes.sponsorNote ?? null,
	studentNote: notes.studentNote ?? null,
	sponsorProofUrl: status === DisbursementStatus.Initiated ? null : PROOF_IMAGE,
	studentProofUrl: status === DisbursementStatus.Received ? PROOF_IMAGE : null,
	sentAt: dates.sentAt ? new Date(dates.sentAt) : null,
	receivedAt: dates.receivedAt ? new Date(dates.receivedAt) : null,
	scholarshipName,
	studentFirstName: "Maria",
	studentLastName: "Santos",
	paymentMethod: {
		method: { id: 1, name: methodName, code: method },
		accountName,
		accountNumber,
	},
});

const mockDisbursements: Disbursement[] = [
	disbursement(
		"Makati Future Leaders Scholarship",
		50000,
		DisbursementStatus.Received,
		PaymentMethod.GCash,
		"GCash",
		"Maria Santos",
		"0917 123 4567",
		{ sentAt: "2026-05-24T10:00:00", receivedAt: "2026-05-25T14:30:00" },
		{
			sponsorNote:
				"First tranche for the first semester. Keep up the good work.",
			studentNote: "Received in full. Thank you so much for the support.",
		},
	),
	disbursement(
		"Iskolar ng Bayan STEM Fund",
		40000,
		DisbursementStatus.Sent,
		PaymentMethod.Maya,
		"Maya",
		"Maria Santos",
		"0998 765 4321",
		{ sentAt: "2026-05-27T11:15:00" },
		{ sponsorNote: "Sent through Maya. Please confirm once it reflects." },
	),
	disbursement(
		"Women in Technology Fellowship",
		45000,
		DisbursementStatus.Initiated,
		PaymentMethod.GCash,
		"GCash",
		"Maria Santos",
		"0917 123 4567",
		{},
		{},
	),
	disbursement(
		"TechForward Engineering Grant",
		60000,
		DisbursementStatus.Received,
		PaymentMethod.GoTyme,
		"GoTyme",
		"Maria Santos",
		"0915 246 8024",
		{ sentAt: "2026-05-18T09:30:00", receivedAt: "2026-05-19T16:45:00" },
		{
			sponsorNote:
				"Full grant for your engineering studies. Wishing you the best.",
			studentNote: "Got it, thank you for believing in my potential.",
		},
	),
	disbursement(
		"Bright Minds Merit Scholarship",
		30000,
		DisbursementStatus.Sent,
		PaymentMethod.Maribank,
		"Maribank",
		"Maria Santos",
		"0917 555 1234",
		{ sentAt: "2026-05-29T13:20:00" },
		{
			sponsorNote:
				"Transfer sent. Kindly confirm once it lands in your account.",
		},
	),
];

/** Returns the mock disbursements shown on the student My Funds page. */
export const getMockStudentDisbursements = (): Disbursement[] =>
	mockDisbursements;

/** Returns a mock disbursement by id, or undefined if not a mock id. */
export const getMockDisbursementById = (id: string): Disbursement | undefined =>
	mockDisbursements.find((d) => d.id === id);
