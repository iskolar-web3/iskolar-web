// Bilingual knowledge base for the on-device FAQ chatbot (English + Tagalog).
//
// The bot can ONLY answer from the entries below. For each entry it indexes the
// English AND Tagalog question and aliases, matches a visitor's question against
// them, detects the question's language, and replies in that language.
//
// Answers are kept short. Use "\n" to break lines and a "- " prefix for bullets;
// the chat widget renders that structure. Links use [label](url).
//
// To teach the bot something new, add an entry (fill in both `en` and `tl`).
// To catch more phrasings, add `aliases`.

export interface LocalizedContent {
	question: string;
	answer: string;
	// Optional alternate phrasings to widen matching (how real users might ask).
	aliases?: string[];
}

export interface Faq {
	en: LocalizedContent;
	tl: LocalizedContent;
}

export const FAQS: Faq[] = [
	{
		en: {
			question: "What is iSkolar?",
			answer:
				"iSkolar is a centralized scholarship hub that connects students with scholarship providers. It streamlines everything from finding scholarships to receiving funds, making education funding accessible and transparent.",
			aliases: [
				"what's iSkolar",
				"tell me about iSkolar",
				"what is this platform",
				"what is this app",
				"what do you do",
			],
		},
		tl: {
			question: "Ano ang iSkolar?",
			answer:
				"Ang iSkolar ay isang sentralisadong scholarship hub na nag-uugnay sa mga estudyante at scholarship provider. Pinapadali nito ang lahat, mula sa paghahanap ng scholarship hanggang sa pagtanggap ng pondo, para maging accessible at transparent ang pondo para sa edukasyon.",
			aliases: [
				"ano ang iSkolar",
				"ano ang platform na ito",
				"ano itong app",
				"tungkol saan ang iSkolar",
				"ano ang ginagawa ninyo",
			],
		},
	},
	{
		en: {
			question: "Who are you?",
			answer:
				"I'm the iSkolar assistant, a chatbot that answers common questions about iSkolar, like how to apply, who can join, and how scholarships work. Ask away!",
			aliases: [
				"what are you",
				"who is this",
				"are you a bot",
				"what can you do",
				"who am I talking to",
			],
		},
		tl: {
			question: "Sino ka?",
			answer:
				"Ako ang iSkolar assistant, isang chatbot na sumasagot sa mga karaniwang tanong tungkol sa iSkolar, tulad ng kung paano mag-apply, sino ang pwedeng sumali, at paano gumagana ang scholarship. Magtanong ka lang!",
			aliases: [
				"sino ka",
				"ano ka",
				"bot ka ba",
				"ano ang kaya mong gawin",
				"kanino ako nakikipag-usap",
			],
		},
	},
	{
		en: {
			question: "Who can use the platform?",
			answer:
				"iSkolar serves three groups:\n- Students looking for scholarships\n- Sponsors (individuals, organizations, or government) who fund and manage scholarships\n- Schools that monitor scholarships and verify enrollment",
			aliases: [
				"who is it for",
				"who can join",
				"who uses iSkolar",
				"who is iSkolar for",
			],
		},
		tl: {
			question: "Sino ang pwedeng gumamit ng platform?",
			answer:
				"May tatlong grupo ang iSkolar:\n- Mga estudyanteng naghahanap ng scholarship\n- Mga sponsor (indibidwal, organisasyon, o gobyerno) na nagpopondo at namamahala ng scholarship\n- Mga paaralan na sumusubaybay sa scholarship at nagve-verify ng enrollment",
			aliases: [
				"para kanino ito",
				"sino ang pwedeng sumali",
				"sino ang gumagamit ng iSkolar",
				"para kanino ang iSkolar",
			],
		},
	},
	{
		en: {
			question: "Is it free for students?",
			answer:
				"Yes, iSkolar is completely free for students. Browse, apply, and track applications at no cost.",
			aliases: [
				"is it free",
				"is iSkolar free",
				"does it cost money",
				"are there any fees",
				"how much does it cost",
			],
		},
		tl: {
			question: "Libre ba ito para sa mga estudyante?",
			answer:
				"Oo, ganap na libre ang iSkolar para sa mga estudyante. Mag-browse, mag-apply, at subaybayan ang application nang walang bayad.",
			aliases: [
				"libre ba ito",
				"libre ba ang iSkolar",
				"may bayad ba",
				"magkano ang gastos",
				"may babayaran ba",
			],
		},
	},
	{
		en: {
			question: "How do I apply for a scholarship?",
			answer:
				'Browse the scholarships, check the requirements, then tap "Apply Now." Fill out the form and upload your documents right in the app.',
			aliases: [
				"how to apply",
				"how can I apply",
				"applying for a scholarship",
				"how do I submit an application",
			],
		},
		tl: {
			question: "Paano mag-apply para sa scholarship?",
			answer:
				'I-browse ang mga scholarship, tingnan ang requirements, at i-tap ang "Apply Now." Sagutan ang form at i-upload ang iyong mga dokumento sa app.',
			aliases: [
				"paano mag-apply",
				"paano ako mag-aapply",
				"pano mag-apply sa scholarship",
				"paano mag-submit ng application",
			],
		},
	},
	{
		en: {
			question: "How does iSkolar work?",
			answer:
				"iSkolar connects students and sponsors:\n- Students find scholarships, apply, and upload documents\n- They track each application in real time\n- Approved funds are released transparently\n- Sponsors create scholarships, review applicants, and disburse funds",
			aliases: [
				"how does it work",
				"how do you work",
				"how does this work",
				"how it works",
				"how does the platform work",
			],
		},
		tl: {
			question: "Paano gumagana ang iSkolar?",
			answer:
				"Pinag-uugnay ng iSkolar ang estudyante at sponsor:\n- Naghahanap ang estudyante ng scholarship, nag-a-apply, at nag-u-upload ng dokumento\n- Sinusubaybayan ang bawat application nang real time\n- Transparent na inilalabas ang aprubadong pondo\n- Gumagawa ang sponsor ng scholarship, sinusuri ang aplikante, at namamahagi ng pondo",
			aliases: [
				"paano ito gumagana",
				"paano gumagana ito",
				"paano gumagana ang platform",
				"pano ito gumagana",
			],
		},
	},
	{
		en: {
			question: "How are users and scholarships verified?",
			answer:
				"Sponsors must pass identity verification before creating scholarships, and students are verified too. This keeps applications authentic and prevents fraud.",
			aliases: [
				"how does verification work",
				"do I need to verify my identity",
				"how do you prevent fraud",
				"is it legit",
			],
		},
		tl: {
			question: "Paano bini-verify ang mga user at scholarship?",
			answer:
				"Kailangang makapasa sa identity verification ang mga sponsor bago makagawa ng scholarship, at bini-verify din ang mga estudyante. Pinapanatili nitong totoo ang application at iniiwasan ang pandaraya.",
			aliases: [
				"paano gumagana ang verification",
				"kailangan ko bang mag-verify ng identity",
				"paano niyo pinipigilan ang scam",
				"totoo ba ito",
			],
		},
	},
	{
		en: {
			question: "How do I get started as a sponsor?",
			answer:
				'Tap "Get Started" and choose the Sponsor role. Provide your details, verify your identity, then start creating scholarship programs.',
			aliases: [
				"how do I become a sponsor",
				"how do I create a scholarship",
				"I want to sponsor a scholarship",
				"how do sponsors sign up",
			],
		},
		tl: {
			question: "Paano magsimula bilang sponsor?",
			answer:
				'I-tap ang "Get Started" at piliin ang Sponsor role. Ibigay ang iyong detalye, i-verify ang pagkakakilanlan, at simulan nang gumawa ng scholarship program.',
			aliases: [
				"paano ako magiging sponsor",
				"paano gumawa ng scholarship",
				"gusto kong mag-sponsor ng scholarship",
				"paano mag-sign up ang sponsor",
			],
		},
	},
	{
		en: {
			question: "What role do schools play on iSkolar?",
			answer:
				"Schools can:\n- Monitor student scholarships\n- Receive tuition in fiat or crypto\n- Verify enrollment\n- Support transparency between students and sponsors",
			aliases: [
				"what do schools do",
				"how do schools use iSkolar",
				"role of schools",
			],
		},
		tl: {
			question: "Ano ang papel ng mga paaralan sa iSkolar?",
			answer:
				"Maaaring gawin ng mga paaralan ang:\n- Pagsubaybay sa scholarship ng estudyante\n- Pagtanggap ng matrikula sa fiat o crypto\n- Pag-verify ng enrollment\n- Pagsuporta sa transparency sa estudyante at sponsor",
			aliases: [
				"ano ang ginagawa ng mga paaralan",
				"paano ginagamit ng paaralan ang iSkolar",
				"papel ng paaralan",
			],
		},
	},
	{
		en: {
			question: "How are scholarship funds disbursed?",
			answer:
				"Approved funds go to your linked wallet on the sponsor's schedule. The full disbursement trail stays transparent for students, sponsors, and schools.",
			aliases: [
				"how are funds disbursed",
				"how do I get paid",
				"how is the money released",
				"when do I receive the money",
				"how does disbursement work",
			],
		},
		tl: {
			question: "Paano ipinamamahagi ang pondo ng scholarship?",
			answer:
				"Ang aprubadong pondo ay napupunta sa iyong naka-link na wallet ayon sa iskedyul ng sponsor. Nananatiling transparent ang daloy ng pondo para sa estudyante, sponsor, at paaralan.",
			aliases: [
				"paano ipinamamahagi ang pondo",
				"paano ako babayaran",
				"kailan ko matatanggap ang pera",
				"paano gumagana ang disbursement",
			],
		},
	},
	{
		en: {
			question: "What is the application status flow?",
			answer:
				"Applications move through:\n- Pending\n- Shortlisted\n- Approved or Denied\n- Granted\nYou can track your stage anytime in your dashboard.",
			aliases: [
				"what are the application stages",
				"what does shortlisted mean",
				"application statuses",
			],
		},
		tl: {
			question: "Ano ang daloy ng status ng application?",
			answer:
				"Dumadaan ang application sa:\n- Pending\n- Shortlisted\n- Approved o Denied\n- Granted\nMasusubaybayan mo ito anumang oras sa iyong dashboard.",
			aliases: [
				"ano ang mga yugto ng application",
				"ano ang ibig sabihin ng shortlisted",
				"mga status ng application",
			],
		},
	},
	{
		en: {
			question: "How do I track my application?",
			answer:
				"Log in and open your dashboard. Each application shows its status: Pending, Shortlisted, Approved/Denied, or Granted.",
			aliases: [
				"where can I see my application",
				"check application status",
				"track my application",
			],
		},
		tl: {
			question: "Paano subaybayan ang aking application?",
			answer:
				"Mag-log in at buksan ang iyong dashboard. Ipinapakita ng bawat application ang status nito: Pending, Shortlisted, Approved/Denied, o Granted.",
			aliases: [
				"saan ko makikita ang aking application",
				"i-check ang status ng application",
				"subaybayan ang application ko",
			],
		},
	},
	{
		en: {
			question: "Is my personal data safe?",
			answer:
				"Yes. iSkolar uses identity verification and secure storage, and shares only what's needed for the scholarship process. See our Privacy Policy for details.",
			aliases: [
				"is my data secure",
				"how do you protect my data",
				"privacy",
				"data privacy",
			],
		},
		tl: {
			question: "Ligtas ba ang aking personal na datos?",
			answer:
				"Oo. Gumagamit ang iSkolar ng identity verification at secure na storage, at ibinabahagi lang ang kinakailangan para sa scholarship. Tingnan ang aming Privacy Policy para sa detalye.",
			aliases: [
				"secure ba ang datos ko",
				"paano niyo pinoprotektahan ang datos ko",
				"privacy",
				"pagkapribado ng datos",
			],
		},
	},
	{
		en: {
			question: "What is iSkolar's mission and vision?",
			answer:
				"Mission: make education accessible, fair, and transparent by connecting learners, sponsors, and institutions.\nVision: a future where every student can pursue their dream education with transparent funding and a supportive community.",
			aliases: [
				"what is the mission",
				"what is your mission",
				"mission of iSkolar",
				"what is the vision",
				"what is your vision",
				"mission and vision",
			],
		},
		tl: {
			question: "Ano ang misyon at pananaw ng iSkolar?",
			answer:
				"Misyon: gawing accessible, patas, at transparent ang edukasyon sa pamamagitan ng pag-uugnay sa mga mag-aaral, sponsor, at institusyon.\nPananaw: isang kinabukasan kung saan kayang ituloy ng bawat estudyante ang pangarap na edukasyon, na may transparent na pondo at suportadong komunidad.",
			aliases: [
				"ano ang misyon",
				"ano ang misyon ninyo",
				"misyon ng iSkolar",
				"ano ang pananaw",
				"ano ang bisyon",
				"misyon at pananaw",
			],
		},
	},
	{
		en: {
			question: "What are iSkolar's SDGs?",
			answer:
				"iSkolar supports several UN Sustainable Development Goals:\n- SDG 4 (Quality Education): wider access to scholarships\n- SDG 10 (Reduced Inequalities): fair access for all\n- SDG 9 (Innovation & Infrastructure): a digital scholarship platform\n- SDG 17 (Partnerships): working with schools, government, NGOs, and sponsors",
			aliases: [
				"what are the SDGs for iSkolar",
				"sustainable development goals",
				"which SDGs does iSkolar support",
				"SDG alignment",
				"UN goals",
			],
		},
		tl: {
			question: "Ano ang mga SDG ng iSkolar?",
			answer:
				"Sinusuportahan ng iSkolar ang ilang UN Sustainable Development Goals:\n- SDG 4 (Quality Education): mas malawak na access sa scholarship\n- SDG 10 (Reduced Inequalities): patas na access para sa lahat\n- SDG 9 (Innovation & Infrastructure): isang digital na scholarship platform\n- SDG 17 (Partnerships): pakikipagtulungan sa paaralan, gobyerno, NGO, at sponsor",
			aliases: [
				"ano ang mga SDG para sa iSkolar",
				"sustainable development goals",
				"anong SDG ang sinusuportahan ng iSkolar",
				"SDG alignment",
				"mga layunin ng UN",
			],
		},
	},
	{
		en: {
			question: "Who is the team behind iSkolar?",
			answer:
				"iSkolar is built by a team of Filipino students. The founders:\n- [Justin Luzano](https://www.linkedin.com/in/justinluzano23/), CEO\n- [Louigie Caminoy](https://www.linkedin.com/in/louie1221), CTO\n- [Adam Ruadilla](https://www.linkedin.com/in/adam-ruadilla/), COO\n- [Jeselle Francisco](https://www.linkedin.com/in/maria-jeselle-francisco-736491369/), CFO\nMeet the full team on our About page.",
			aliases: [
				"who are the team",
				"who are the teams",
				"who is the team",
				"who made iSkolar",
				"who created iSkolar",
				"who built iSkolar",
				"who's behind iSkolar",
				"meet the team",
				"the founders",
				"who are the founders",
			],
		},
		tl: {
			question: "Sino ang team sa likod ng iSkolar?",
			answer:
				"Binuo ang iSkolar ng isang team ng mga Pilipinong estudyante. Ang mga founder:\n- [Justin Luzano](https://www.linkedin.com/in/justinluzano23/), CEO\n- [Louigie Caminoy](https://www.linkedin.com/in/louie1221), CTO\n- [Adam Ruadilla](https://www.linkedin.com/in/adam-ruadilla/), COO\n- [Jeselle Francisco](https://www.linkedin.com/in/maria-jeselle-francisco-736491369/), CFO\nMakikilala mo ang buong team sa aming About page.",
			aliases: [
				"sino ang team",
				"sino ang mga team",
				"sino ang gumawa ng iSkolar",
				"sino ang nasa likod ng iSkolar",
				"kilalanin ang team",
				"sino ang mga founder",
				"sino ang nagtatag ng iSkolar",
			],
		},
	},
	{
		en: {
			question: "What is iSkolar's roadmap?",
			answer:
				"iSkolar's 2026 roadmap:\n- Q1 2026, Pilot Launch: MVP with registration, scholarship creation, discovery, applications, scholar selection, and tracking\n- Q2 2026, AI & Blockchain: full launch with AI-powered processes, blockchain fund disbursements, identity verification, and school features\n- Q3 2026, Institutional Integrations: onboarding schools, organizations, and government with dedicated dashboards\n- Q4 2026, Nationwide Rollout: scaling across the Philippines with a mobile app and expanded partnerships",
			aliases: [
				"what is the roadmap",
				"what's next for iSkolar",
				"future plans",
				"what are your plans",
				"when is the launch",
				"what's coming",
				"product timeline",
				"milestones",
				"when does iSkolar launch",
			],
		},
		tl: {
			question: "Ano ang roadmap ng iSkolar?",
			answer:
				"Ang roadmap ng iSkolar para sa 2026:\n- Q1 2026, Pilot Launch: MVP na may registration, paggawa ng scholarship, discovery, application, pagpili ng scholar, at pagsubaybay\n- Q2 2026, AI at Blockchain: ganap na launch na may AI-powered na proseso, blockchain na disbursement ng pondo, identity verification, at mga school feature\n- Q3 2026, Institutional Integrations: pag-onboard ng mga paaralan, organisasyon, at gobyerno na may sariling dashboard\n- Q4 2026, Nationwide Rollout: pagpapalawak sa buong Pilipinas na may mobile app at mas maraming partnership",
			aliases: [
				"ano ang roadmap",
				"ano ang mga plano",
				"kailan ang launch",
				"ano ang susunod sa iSkolar",
				"mga plano sa hinaharap",
				"kailan ilulunsad ang iSkolar",
			],
		},
	},
	{
		en: {
			question: "Who are iSkolar's partners?",
			answer:
				"iSkolar works with several partners.\nStrategic Incubation Partners:\n- [BYC Ventures](https://byc.ventures)\n- [QBO Innovation Hub](https://www.qboinnovation.com/)\n- [Tutorials Dojo](https://tutorialsdojo.com)\nCommunity Partners:\n- [Cryptita Plays](https://cryptitaplays.org)\n- [Tech Kubo](https://techkubo.com/)\n- [AWS Learning Club Heron](https://www.facebook.com/awslearningclubheron)",
			aliases: [
				"who are your partners",
				"list of partners",
				"iSkolar partners",
				"who do you work with",
				"partnerships",
				"who supports iSkolar",
				"incubation partners",
				"community partners",
				"who are you partnered with",
			],
		},
		tl: {
			question: "Sino ang mga partner ng iSkolar?",
			answer:
				"Nakikipagtulungan ang iSkolar sa ilang partner.\nStrategic Incubation Partners:\n- [BYC Ventures](https://byc.ventures)\n- [QBO Innovation Hub](https://www.qboinnovation.com/)\n- [Tutorials Dojo](https://tutorialsdojo.com)\nCommunity Partners:\n- [Cryptita Plays](https://cryptitaplays.org)\n- [Tech Kubo](https://techkubo.com/)\n- [AWS Learning Club Heron](https://www.facebook.com/awslearningclubheron)",
			aliases: [
				"sino ang mga partner",
				"mga partner ng iSkolar",
				"kanino kayo nakikipagtulungan",
				"sino ang sumusuporta sa iSkolar",
				"mga partnership",
				"sino ang kasosyo ng iSkolar",
			],
		},
	},
	{
		en: {
			question: "How do I contact support?",
			answer:
				"Email us at hello@iskolar.io. We're happy to help with anything not covered here.",
			aliases: [
				"how to contact",
				"contact support",
				"how do I reach you",
				"support email",
				"get in touch",
				"talk to a human",
			],
		},
		tl: {
			question: "Paano makontak ang support?",
			answer:
				"I-email kami sa hello@iskolar.io. Masaya kaming tumulong sa anumang hindi nasagot dito.",
			aliases: [
				"paano makontak",
				"kontakin ang support",
				"paano kita makakausap",
				"support email",
				"makipag-ugnayan",
			],
		},
	},
];

export type FaqLanguage = "en" | "tl";

// Starter prompts surfaced as clickable chips in the chat widget (English).
export const SUGGESTED_QUESTIONS: string[] = [
	"How do I apply for a scholarship?",
	"Is iSkolar free for students?",
	"How does iSkolar work?",
];
