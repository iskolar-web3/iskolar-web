import type { CreateFormFieldRequest } from "./model";
import { FormFieldType, ScholarshipType } from "./model";

export interface ScholarshipTemplate {
	id: string;
	name: string;
	description: string;
	icon: string;
	scholarshipType: ScholarshipType;
	suggestedTitle: string;
	suggestedDescription: string;
	criterias: string[];
	requirements: string[];
	formFields: CreateFormFieldRequest[];
	amountType: "fixed" | "range" | "varies";
}

// Sorted alphabetically by name
export const SCHOLARSHIP_TEMPLATES: readonly ScholarshipTemplate[] = [
	{
		id: "academic-excellence",
		name: "Academic Excellence",
		description: "For students with outstanding grades, skills, or achievements.",
		icon: "GraduationCap",
		scholarshipType: ScholarshipType.MeritBased,
		suggestedTitle: "Academic Excellence Scholarship",
		suggestedDescription: `This scholarship is awarded to outstanding Filipino students who have demonstrated exceptional academic performance and a strong commitment to their studies.

We believe that academic excellence deserves recognition and support. This grant aims to ease the financial burden on high-achieving students so they can focus on reaching their full potential.

Scholars will be selected based on their academic records, achievements, and character. All applicants must meet the eligibility requirements and submit complete documents by the deadline.`,
		amountType: "fixed",
		criterias: [
			"Must be a Filipino citizen",
			"Must be enrolled in an accredited institution",
			"Must be a full-time student",
			"Must demonstrate good academic standing",
			"Must have no disciplinary record",
		],
		requirements: [
			"Certificate of Enrollment",
			"Latest Report of Grades",
			"Transcript of Records (TOR)",
			"Certificate of Good Moral Character",
			"2x2 ID Photo",
		],
		formFields: [
			{
				label: "What is your current GWA or GPA?",
				isRequired: true,
				fieldType: FormFieldType.ShortAnswer,
				options: [],
			},
			{
				label: "Describe your most significant academic achievement",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
		],
	},
	{
		id: "arts-and-culture",
		name: "Arts & Culture",
		description: "For students with talent in visual arts, music, theater, or literature.",
		icon: "Palette",
		scholarshipType: ScholarshipType.MeritBased,
		suggestedTitle: "Arts & Culture Scholarship",
		suggestedDescription: `This scholarship is dedicated to Filipino students who carry the richness of our culture through their art. Whether through music, visual arts, theater, dance, film, or literature — we believe creative expression is as vital as any other discipline.

We are looking for students who have shown dedication to their craft and whose work reflects depth, authenticity, and a strong sense of identity. Academic standing is considered alongside artistic merit.

Applicants are encouraged to submit a portfolio or sample of their work. We look forward to discovering voices and visions that deserve to be heard and seen.`,
		amountType: "fixed",
		criterias: [
			"Must be a Filipino citizen",
			"Must be enrolled in an accredited institution",
			"Must be a full-time student",
			"Must demonstrate good academic standing",
		],
		requirements: [
			"Certificate of Enrollment",
			"Latest Report of Grades",
			"Personal Statement or Essay",
			"Curriculum Vitae (CV) or Resume",
			"2x2 ID Photo",
		],
		formFields: [
			{
				label: "What is your primary artistic discipline?",
				isRequired: true,
				fieldType: FormFieldType.Dropdown,
				options: [
					{ value: "Visual Arts" },
					{ value: "Music" },
					{ value: "Dance" },
					{ value: "Theater" },
					{ value: "Film" },
					{ value: "Literature" },
					{ value: "Other" },
				],
			},
			{
				label: "Describe your most meaningful creative work or performance",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
			{
				label: "Upload a portfolio or sample of your work",
				isRequired: false,
				fieldType: FormFieldType.File,
				options: [],
			},
		],
	},
	{
		id: "community-leadership",
		name: "Community Leadership",
		description: "For students who demonstrate leadership and community involvement.",
		icon: "Users",
		scholarshipType: ScholarshipType.Combined,
		suggestedTitle: "Community Leadership Scholarship",
		suggestedDescription: `This scholarship recognizes Filipino students who go beyond academics — those who take initiative, serve their communities, and inspire others through meaningful action.

We are looking for individuals who have demonstrated leadership in their schools, organizations, or local communities. Whether through organizing events, leading advocacy efforts, or volunteering, we want to support students who are making a difference.

Scholars are selected based on a combination of academic standing and demonstrated impact in their community. Applicants should be prepared to share their experiences and provide supporting documents.`,
		amountType: "range",
		criterias: [
			"Must be a Filipino citizen",
			"Must be enrolled in an accredited institution",
			"Must be a full-time student",
			"Must demonstrate good academic standing",
			"Must have no disciplinary record",
		],
		requirements: [
			"Certificate of Enrollment",
			"Latest Report of Grades",
			"Recommendation Letter",
			"Personal Statement or Essay",
			"Curriculum Vitae (CV) or Resume",
			"2x2 ID Photo",
		],
		formFields: [
			{
				label: "Describe a community project or initiative you have led",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
			{
				label: "How many hours of community service have you completed?",
				isRequired: true,
				fieldType: FormFieldType.Number,
				options: [],
			},
			{
				label: "Upload proof of community involvement",
				isRequired: false,
				fieldType: FormFieldType.File,
				options: [],
			},
		],
	},
	{
		id: "financial-assistance",
		name: "Financial Assistance",
		description: "For students with limited financial resources who need support.",
		icon: "HandHeart",
		scholarshipType: ScholarshipType.NeedBased,
		suggestedTitle: "Financial Assistance Scholarship",
		suggestedDescription: `This scholarship provides financial support to deserving Filipino students whose academic journey is hindered by economic hardship. We are committed to ensuring that no qualified student is left behind due to financial constraints.

Grantees will receive assistance to help cover tuition, allowances, or other school-related expenses. Priority will be given to applicants who demonstrate genuine financial need and a sincere desire to complete their education.

All submitted documents will be treated with strict confidentiality. Applicants are encouraged to be honest and thorough in their application.`,
		amountType: "fixed",
		criterias: [
			"Must be a Filipino citizen",
			"Must be enrolled in an accredited institution",
			"Must be a full-time student",
			"Must not be receiving other scholarships",
		],
		requirements: [
			"Certificate of Enrollment",
			"Certificate of Indigency",
			"Income Tax Return (ITR)",
			"Birth Certificate (PSA)",
			"Valid Government ID",
			"Parent or Guardian's Valid ID",
		],
		formFields: [
			{
				label: "Briefly describe your family's financial situation",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
			{
				label: "How many family members are currently enrolled in school?",
				isRequired: true,
				fieldType: FormFieldType.Number,
				options: [],
			},
			{
				label: "Are you currently employed?",
				isRequired: true,
				fieldType: FormFieldType.Dropdown,
				options: [
					{ value: "Yes, full-time" },
					{ value: "Yes, part-time" },
					{ value: "No" },
				],
			},
		],
	},
	{
		id: "farmers-fisherfolk",
		name: "Farmers & Fisherfolk",
		description: "For children and dependents of farmers, fisherfolk, and agricultural workers.",
		icon: "Wheat",
		scholarshipType: ScholarshipType.NeedBased,
		suggestedTitle: "Farmers & Fisherfolk Scholarship",
		suggestedDescription: `This scholarship is for children and dependents of Filipino farmers, fisherfolk, and other agricultural workers — the backbone of our food system whose own educational opportunities are often limited.

We recognize the hardship that farming and fishing families endure, and we want to invest in the next generation so that their children can access the education and opportunities their parents worked hard to provide.

Priority will be given to applicants from households whose primary source of income is agriculture or fishery. Applicants are encouraged to be honest and detailed in their application.`,
		amountType: "fixed",
		criterias: [
			"Must be a Filipino citizen",
			"Must be enrolled in an accredited institution",
			"Must be a full-time student",
			"Must not be receiving other scholarships",
			"Must be a dependent of a farmer, fisherfolk, or agricultural worker",
		],
		requirements: [
			"Certificate of Enrollment",
			"Certificate of Indigency",
			"Birth Certificate (PSA)",
			"Valid Government ID",
			"Parent or Guardian's Valid ID",
			"Proof of Agricultural or Fishery Livelihood (e.g. farm registration, fishing permit)",
		],
		formFields: [
			{
				label: "What is your parent or guardian's primary source of livelihood?",
				isRequired: true,
				fieldType: FormFieldType.Dropdown,
				options: [
					{ value: "Farming (rice, corn, vegetables, etc.)" },
					{ value: "Fishing / Aquaculture" },
					{ value: "Livestock raising" },
					{ value: "Other agricultural work" },
				],
			},
			{
				label: "Describe your family's living situation and how you are funding your education",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
			{
				label: "What do you hope to accomplish after completing your studies?",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
		],
	},
	{
		id: "ofw-dependent",
		name: "OFW Dependent",
		description: "For children and dependents of Overseas Filipino Workers.",
		icon: "Plane",
		scholarshipType: ScholarshipType.NeedBased,
		suggestedTitle: "OFW Dependent Scholarship",
		suggestedDescription: `This scholarship honors the sacrifices of Overseas Filipino Workers by investing in their children's education. We recognize that OFW families carry a unique burden, and we want to ensure that the children they work hard for have every opportunity to succeed.

Applicants must be a dependent of a currently deployed or recently returned OFW. Priority is given to those with demonstrated financial need and a consistent record of academic effort.

We hope this scholarship helps bridge the distance — allowing scholars to build a future worthy of their family's sacrifices.`,
		amountType: "fixed",
		criterias: [
			"Must be a Filipino citizen",
			"Must be enrolled in an accredited institution",
			"Must be a full-time student",
			"Must not be receiving other scholarships",
			"Must be a dependent of an active or returning OFW",
		],
		requirements: [
			"Certificate of Enrollment",
			"Latest Report of Grades",
			"Birth Certificate (PSA)",
			"OFW Employment Contract or Proof of Deployment",
			"Valid Government ID",
			"Parent or Guardian's Valid ID",
		],
		formFields: [
			{
				label: "In what country is your parent/guardian currently or recently working?",
				isRequired: true,
				fieldType: FormFieldType.ShortAnswer,
				options: [],
			},
			{
				label: "What is your parent/guardian's job or profession abroad?",
				isRequired: true,
				fieldType: FormFieldType.ShortAnswer,
				options: [],
			},
			{
				label: "How has your parent's work abroad affected your life and studies?",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
		],
	},
	{
		id: "pwd-scholarship",
		name: "Persons with Disability (PWD)",
		description: "For students with physical, sensory, or learning disabilities.",
		icon: "Accessibility",
		scholarshipType: ScholarshipType.Combined,
		suggestedTitle: "PWD Scholarship",
		suggestedDescription: `This scholarship is committed to breaking barriers for Filipino students living with disabilities. We believe that a physical, sensory, or learning disability should never prevent a student from accessing quality education.

We are looking for individuals who have shown resilience, determination, and a genuine passion for learning despite the challenges they face. Academic performance, financial need, and the nature of the applicant's disability will all be considered in the selection process.

All applications are treated with full respect and confidentiality. We are dedicated to creating an inclusive and supportive environment for every scholar we accept.`,
		amountType: "varies",
		criterias: [
			"Must be a Filipino citizen",
			"Must be enrolled in an accredited institution",
			"Must be a full-time student",
			"Must have a recognized physical, sensory, or learning disability",
			"Must not be receiving other scholarships",
		],
		requirements: [
			"Certificate of Enrollment",
			"Latest Report of Grades",
			"PWD Identification Card",
			"Medical Certificate",
			"Birth Certificate (PSA)",
			"Valid Government ID",
		],
		formFields: [
			{
				label: "Please describe your disability and how it affects your daily life and studies",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
			{
				label: "What specific support or accommodation would help you most as a scholar?",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
			{
				label: "Have you received any scholarship or financial assistance before?",
				isRequired: true,
				fieldType: FormFieldType.Dropdown,
				options: [
					{ value: "Yes" },
					{ value: "No" },
				],
			},
		],
	},
	{
		id: "sports-achievement",
		name: "Sports Achievement",
		description: "For student-athletes with outstanding performance in local or national competitions.",
		icon: "Trophy",
		scholarshipType: ScholarshipType.MeritBased,
		suggestedTitle: "Sports Achievement Scholarship",
		suggestedDescription: `This scholarship is for Filipino student-athletes who have demonstrated excellence both on the field and in the classroom. We believe sports build character, discipline, and resilience — qualities that extend far beyond competition.

We are looking for athletes who have represented their school, region, or country in recognized sports competitions and who continue to pursue their academic goals with the same dedication they bring to their sport.

Applicants must provide official documentation of their athletic achievements. Scholars are expected to maintain their academic standing and uphold the values of sportsmanship throughout the grant period.`,
		amountType: "fixed",
		criterias: [
			"Must be a Filipino citizen",
			"Must be enrolled in an accredited institution",
			"Must be a full-time student",
			"Must demonstrate good academic standing",
			"Must have no disciplinary record",
		],
		requirements: [
			"Certificate of Enrollment",
			"Latest Report of Grades",
			"Certificate or Medal from Sports Competition",
			"Endorsement from School Athletic Director or Coach",
			"Curriculum Vitae (CV) or Resume",
			"2x2 ID Photo",
		],
		formFields: [
			{
				label: "What sport do you compete in?",
				isRequired: true,
				fieldType: FormFieldType.ShortAnswer,
				options: [],
			},
			{
				label: "List your most significant sports achievements (competition, level, award)",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
			{
				label: "How do you manage your studies alongside your athletic training?",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
		],
	},
	{
		id: "stem-scholarship",
		name: "STEM",
		description: "For students pursuing science, technology, engineering, or mathematics.",
		icon: "FlaskConical",
		scholarshipType: ScholarshipType.MeritBased,
		suggestedTitle: "STEM Scholarship",
		suggestedDescription: `This scholarship supports Filipino students who are pursuing degrees in Science, Technology, Engineering, or Mathematics. We are investing in the next generation of innovators, researchers, and problem-solvers who will shape the future of the country.

Applicants should demonstrate both academic excellence and a genuine passion for their chosen STEM field. We are especially interested in students who show initiative — whether through research, personal projects, or involvement in technical competitions.

Selected scholars will join a growing community of STEM-driven individuals committed to using their knowledge for meaningful progress. Incomplete applications will not be considered.`,
		amountType: "fixed",
		criterias: [
			"Must be a Filipino citizen",
			"Must be enrolled in an accredited institution",
			"Must be a full-time student",
			"Must demonstrate good academic standing",
			"Must maintain regular academic load as prescribed by the institution",
		],
		requirements: [
			"Certificate of Enrollment",
			"Latest Report of Grades",
			"Transcript of Records (TOR)",
			"Recommendation Letter",
			"Valid Government ID",
		],
		formFields: [
			{
				label: "What STEM program are you enrolled in?",
				isRequired: true,
				fieldType: FormFieldType.ShortAnswer,
				options: [],
			},
			{
				label: "Describe a research project or technical achievement you are proud of",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
			{
				label: "What is your current GWA or GPA?",
				isRequired: true,
				fieldType: FormFieldType.ShortAnswer,
				options: [],
			},
		],
	},
	{
		id: "technical-vocational",
		name: "Technical-Vocational",
		description: "For students enrolled in TESDA-accredited technical or vocational programs.",
		icon: "Wrench",
		scholarshipType: ScholarshipType.NeedBased,
		suggestedTitle: "Technical-Vocational Scholarship",
		suggestedDescription: `This scholarship supports Filipino students enrolled in technical and vocational programs accredited by TESDA. We recognize that skilled trades and technical expertise are the backbone of our economy, and we are committed to making these pathways more accessible.

Priority is given to students from low-income families who are pursuing certifications or diplomas in fields such as automotive, electrical, welding, electronics, cookery, beauty care, and other in-demand trades.

Scholars are expected to complete their program and uphold the standards of their chosen field. We are proud to support students who are building practical skills that lead directly to meaningful employment.`,
		amountType: "fixed",
		criterias: [
			"Must be a Filipino citizen",
			"Must be enrolled in a TESDA-accredited institution or program",
			"Must be a full-time student",
			"Must not be receiving other scholarships",
		],
		requirements: [
			"Certificate of Enrollment",
			"Certificate of Indigency",
			"Birth Certificate (PSA)",
			"Valid Government ID",
			"Parent or Guardian's Valid ID",
		],
		formFields: [
			{
				label: "What technical or vocational program are you enrolled in?",
				isRequired: true,
				fieldType: FormFieldType.ShortAnswer,
				options: [],
			},
			{
				label: "Why did you choose this program and what do you plan to do after completing it?",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
			{
				label: "Have you had any prior work or training experience in this field?",
				isRequired: false,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
		],
	},
	{
		id: "indigenous-peoples",
		name: "Tribal / Indigenous Peoples",
		description: "For students belonging to recognized indigenous cultural communities.",
		icon: "Landmark",
		scholarshipType: ScholarshipType.NeedBased,
		suggestedTitle: "Indigenous Peoples Scholarship",
		suggestedDescription: `This scholarship is dedicated to Filipino students who belong to recognized Indigenous Cultural Communities (ICCs) or Indigenous Peoples (IPs) as identified under Republic Act 8371, the Indigenous Peoples' Rights Act.

We are committed to honoring the cultural heritage of our indigenous communities by helping their youth access higher education. Applicants must hold official NCIP documentation confirming their indigenous identity.

We hope this scholarship enables scholars to pursue their dreams while remaining rooted in and proud of their heritage. Community endorsement and parental or guardian consent are strongly encouraged.`,
		amountType: "varies",
		criterias: [
			"Must be a Filipino citizen",
			"Must be enrolled in an accredited institution",
			"Must be a full-time student",
			"Must be a recognized member of an Indigenous Cultural Community (ICC) or Indigenous Peoples (IP) group",
			"Must not be receiving other scholarships",
		],
		requirements: [
			"Certificate of Enrollment",
			"Latest Report of Grades",
			"NCIP Certificate of Tribal Membership or Affiliation",
			"Birth Certificate (PSA)",
			"Barangay Clearance",
			"Valid Government ID",
		],
		formFields: [
			{
				label: "What indigenous community or tribe do you belong to?",
				isRequired: true,
				fieldType: FormFieldType.ShortAnswer,
				options: [],
			},
			{
				label: "How has your indigenous background shaped your identity and aspirations?",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
			{
				label: "What do you hope to contribute to your community after completing your studies?",
				isRequired: true,
				fieldType: FormFieldType.Paragraph,
				options: [],
			},
		],
	},
] as const;
