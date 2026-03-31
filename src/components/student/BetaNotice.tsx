import { useEffect, useState } from "react";
import {
	ChevronRight,
	ExternalLink,
	Facebook,
	Linkedin,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { JSX } from "react";

const socialLinks = [
	{
		name: "Discord",
		icon: ({ size = 18 }: { size?: number }) => (
			<svg
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
			</svg>
		),
		href: "https://discord.gg/Jw8xDA8Hnx",
	},
	{
		name: "Facebook",
		icon: Facebook,
		href: "https://www.facebook.com/profile.php?id=61575967087555",
	},
	{
		name: "LinkedIn",
		icon: Linkedin,
		href: "https://www.linkedin.com/company/107364901",
	},
];

const BLOG_POST = {
	title: "BYC Ventures and iSkolar Formalize Collaboration",
	href: "https://byc.ventures/news/byc-ventures-and-iskolar-formalize-collaboration-to-advance-verifiable-credential-infrastructure",
};

const landingLinks = [
	{ label: "Our Roadmap", href: "/#roadmap" },
	{ label: "Our Mission", href: "/about/#mission-vision" },
	{ label: "iSkolar Team", href: "/about/#team" },
];

const SHOW_BETA_NOTICE = import.meta.env.VITE_SHOW_BETA_NOTICE !== "false";
const COUNTDOWN_SECONDS = 6;
const DISMISSED_KEY = "betaNotice_dismissed";

function shouldShowModal(): boolean {
	if (!SHOW_BETA_NOTICE) return false;
	if (localStorage.getItem(DISMISSED_KEY) === "true") return false;
	return true;
}

function useBlogImage(url: string) {
	const [image, setImage] = useState<string | null>(null);

	useEffect(() => {
		fetch(url)
			.then((res) => res.text())
			.then((html) => {
				const match = html.match(
					/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
				);
				if (match?.[1]) {
					setImage(match[1].replace(/&amp;/g, "&"));
				}
			})
			.catch(() => {});
	}, [url]);

	return image;
}

export function BetaNoticeModal(): JSX.Element | null {
	const [open, setOpen] = useState(() => shouldShowModal());
	const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
	const [dontShowAgain, setDontShowAgain] = useState(false);
	const blogImage = useBlogImage(BLOG_POST.href);

	useEffect(() => {
		if (!open) return;
		if (countdown <= 0) return;

		const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
		return () => clearTimeout(timer);
	}, [open, countdown]);

	function handleClose() {
		if (dontShowAgain) {
			localStorage.setItem(DISMISSED_KEY, "true");
		}
		setOpen(false);
	}

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
				>
					{/* Blur backdrop */}
					<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: "spring", damping: 30, stiffness: 300 }}
						className="relative w-full max-w-3xl rounded-2xl border border-[#D3DCF6] bg-white shadow-xl"
					>
						{/* Close button */}
						<button
							type="button"
							onClick={handleClose}
							disabled={countdown > 0}
							className="absolute cursor-pointer top-4 right-4 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F0F7FF]"
						>
							<X size={18} className="text-[#6B7280]" />
						</button>

						<div className="flex flex-col md:flex-row">
							{/* Left column — main content */}
							<div className="flex-1 p-6 md:p-8">
								<h2 className="text-xl md:text-2xl font-semibold text-secondary pr-8">
									You've successfully registered for the beta!
								</h2>

								<p className="mt-2 text-sm md:text-base text-[#6B7280]">
									We're in the process of welcoming our first group of
									scholarship providers. Stay tuned and follow us on social
									media for the latest updates.
								</p>

								<div className="mt-5">
									<h3 className="text-sm md:text-base font-medium text-[#111827]">
										While You Wait
									</h3>
									<ul className="mt-2 space-y-1.5 text-sm md:text-base text-[#6B7280] list-disc list-inside">
										<li>Explore the platform</li>
										<li>
											Join our discord community and follow our socials
											for updates
										</li>
										<li>
											You'll receive an email as soon as scholarships
											become available.
										</li>
									</ul>
								</div>
							</div>

							{/* Right column — links & blog */}
							<div className="md:w-64 border-t md:border-t-0 md:border-l border-[#D3DCF6] p-6 flex flex-col gap-4">
								{/* Social links */}
								<div>
									<p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">
										Social Links
									</p>
									<div className="flex items-center gap-3">
										{socialLinks.map((link) => (
											<a
												key={link.name}
												href={link.href}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#D3DCF6] text-[#3A52A6] hover:bg-[#F0F7FF] transition-colors"
												title={link.name}
											>
												<link.icon size={18} />
											</a>
										))}
									</div>
								</div>

								{/* Landing page links */}
								<div>
									<p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">
										Learn More
									</p>
									<div className="flex flex-col gap-1">
										{landingLinks.map((link) => (
											<a
												key={link.label}
												href={link.href}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#3A52A6] hover:bg-[#F0F7FF] transition-colors group"
											>
												<span>{link.label}</span>
												<ChevronRight
													size={16}
													className="text-[#9CA3AF] group-hover:text-[#3A52A6] transition-colors"
												/>
											</a>
										))}
									</div>
								</div>

								{/* Blog post */}
								<div>
									<p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-2">
										Latest News
									</p>
									<a
										href={BLOG_POST.href}
										target="_blank"
										rel="noopener noreferrer"
										className="block rounded-lg border border-[#D3DCF6] overflow-hidden hover:border-[#3A52A6] transition-colors group"
									>
										{blogImage && (
											<img
												src={blogImage}
												alt={BLOG_POST.title}
												className="w-full h-32 object-cover"
											/>
										)}
										<div className="p-3">
											<p className="text-sm font-medium text-[#111827] leading-snug">
												{BLOG_POST.title}
											</p>
											<div className="mt-2 inline-flex items-center gap-1 text-xs text-[#9CA3AF] group-hover:text-[#3A52A6] transition-colors">
												Read more
												<ExternalLink size={12} />
											</div>
										</div>
									</a>
								</div>
							</div>
						</div>

						{/* Countdown / Close CTA */}
						<div className="border-t border-[#D3DCF6] px-6 md:px-8 py-4">
							{countdown > 0 ? (
								<p className="text-center text-xs text-[#9CA3AF]">
									You can close this in {countdown}s
								</p>
							) : (
								<div className="flex flex-col gap-3">
									<label className="flex items-center gap-2 cursor-pointer select-none">
										<input
											type="checkbox"
											checked={dontShowAgain}
											onChange={(e) => setDontShowAgain(e.target.checked)}
											className="w-4 h-4 rounded border-[#D3DCF6] accent-[#3A52A6] cursor-pointer"
										/>
										<span className="text-sm text-[#6B7280]">Don't show again</span>
									</label>
									<button
										type="button"
										onClick={handleClose}
										className="w-full py-2.5 cursor-pointer rounded-lg bg-[#3A52A6] text-white text-sm font-medium hover:bg-[#2f4389] transition-colors"
									>
										Got it, let's go!
									</button>
								</div>
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
