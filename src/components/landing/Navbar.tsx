import { Link, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { products } from "@/components/landing/products";

const homeSections = [
	{ name: "Home", id: "home" },
	{ name: "Products", id: "products" },
	{ name: "Ecosystem", id: "ecosystem" },
	{ name: "In the News", id: "in-the-news" },
	{ name: "FAQs", id: "faqs" },
];

const aboutSections = [
	{ name: "Company Overview", id: "company-overview" },
	{ name: "Mission & Vision", id: "mission-vision" },
	{ name: "Partnerships", id: "partnerships" },
	{ name: "Our Team", id: "team" },
];

type NavItem = { name: string; href: string; hint?: string };
type NavLink = { name: string; href: string; dropdown: NavItem[] };

// Hash links stay on the current page; everything else is prefixed with its route.
function buildLinks(onAbout: boolean): NavLink[] {
	const home = onAbout ? "/#" : "#";
	const about = onAbout ? "#" : "/about#";
	return [
		{
			name: "Home",
			href: "/",
			dropdown: homeSections.map((s) => ({
				name: s.name,
				href: `${home}${s.id}`,
			})),
		},
		{
			name: "Products",
			href: "/",
			dropdown: products.map((p) => ({
				name: p.name,
				hint: p.stage,
				href: `${home}${p.id}`,
			})),
		},
		{
			name: "About",
			href: "/about",
			dropdown: aboutSections.map((s) => ({
				name: s.name,
				href: `${about}${s.id}`,
			})),
		},
	];
}

const homeLinks = buildLinks(false);
const aboutLinks = buildLinks(true);

export default function Navbar() {
	const location = useLocation();
	const isAboutPage =
		location.pathname === "/about" || location.pathname === "/about/";
	const navLinks = isAboutPage ? aboutLinks : homeLinks;

	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);

		// Close dropdown when clicking outside
		const handleClickOutside = (event: MouseEvent) => {
			if (activeDropdown && !(event.target as Element).closest(".relative")) {
				setActiveDropdown(null);
			}
		};
		document.addEventListener("click", handleClickOutside);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			document.removeEventListener("click", handleClickOutside);
		};
	}, [activeDropdown]);

	const handleNavClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		href: string,
	) => {
		const hashOnly = href.startsWith("#");
		const pathBeforeHash = href.split("#")[0];
		const samePageHash = href.includes("#") && pathBeforeHash === location.pathname;

		if (hashOnly || samePageHash) {
			e.preventDefault();
			const hash = href.includes("#") ? `#${href.split("#")[1]}` : href;
			const element = document.querySelector(hash);
			if (element) {
				element.scrollIntoView({ behavior: "smooth" });
			}
			setIsMobileMenuOpen(false);
		}
	};

	return (
		<nav className="fixed top-0 z-50 w-full px-3 pt-3 sm:px-6">
			<div
				className={`mx-auto max-w-6xl rounded-full border px-4 sm:px-6 transition-all duration-500 ${
					isScrolled || isMobileMenuOpen
						? "border-secondary/15 bg-card/80 shadow-[0_12px_40px_-20px_rgba(58,82,166,0.45)] backdrop-blur-xl"
						: "border-transparent bg-transparent"
				}`}
			>
				<div className="flex h-14 items-center justify-between lg:h-16">
					{/* Logo */}
					<a href="/#home" className="flex items-center gap-2">
						<div className="w-24 h-9 md:w-28 md:h-11 flex items-center justify-center">
							<img
								src={"/logo2.png"}
								alt="Logo"
								className="w-full h-full object-cover"
							/>
						</div>
					</a>

					{/* Desktop Navigation */}
					<div className="hidden lg:flex items-center gap-8">
						<AnimatePresence mode="wait">
							{navLinks.map((link, index) => (
								<motion.div
									key={link.name}
									className="relative"
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{
										duration: 0.3,
										delay: index * 0.05,
										ease: "easeOut",
									}}
								>
									{!link.href.startsWith("#") ? (
										<Link
											to={link.href.split("#")[0] as "/"}
											preload="intent"
											onClick={(e) => {
												if (link.dropdown) {
													e.preventDefault();
													setActiveDropdown(
														activeDropdown === link.name ? null : link.name,
													);
												} else {
													handleNavClick(e, link.href);
												}
											}}
											className={`relative flex items-center gap-1 text-sm font-medium text-secondary transition-colors hover:text-secondary/80 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-secondary/40 after:transition-transform after:duration-300 hover:after:scale-x-100 motion-reduce:after:transition-none ${activeDropdown === link.name ? "text-secondary/80 after:scale-x-100" : ""}`}
										>
											{link.name}
											{link.dropdown && (
												<ChevronDown
													className={`w-4 h-4 transition-transform duration-200 ${
														activeDropdown === link.name ? "rotate-180" : ""
													}`}
												/>
											)}
										</Link>
									) : (
										<a
											href={link.href}
											onClick={(e) => handleNavClick(e, link.href)}
											className="relative flex items-center gap-1 text-sm font-medium text-secondary transition-colors hover:text-secondary/80 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-secondary/40 after:transition-transform after:duration-300 hover:after:scale-x-100 motion-reduce:after:transition-none"
										>
											{link.name}
										</a>
									)}

									{/* Dropdown */}
									<AnimatePresence>
										{link.dropdown && activeDropdown === link.name && (
											<motion.div
												initial={{ opacity: 0, y: -8 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -8 }}
												transition={{ duration: 0.2, ease: "easeOut" }}
												className="absolute top-full left-1/2 -translate-x-1/2 mt-4 min-w-56 whitespace-nowrap rounded-2xl border border-secondary/15 bg-card/95 p-1.5 shadow-[0_20px_50px_-24px_rgba(58,82,166,0.5)] backdrop-blur-xl"
											>
												{link.dropdown.map((item) => (
													<a
														key={item.name}
														href={item.href}
														onClick={(e) => {
															if (item.href.startsWith("#")) {
																handleNavClick(e, item.href);
															}
															// If it's a real page navigation, let it happen but close dropdown
															setActiveDropdown(null);
														}}
														className="flex items-center justify-between gap-6 rounded-xl px-3 py-2 text-sm text-secondary transition-colors hover:bg-secondary/[0.07]"
													>
														{item.name}
														{item.hint && (
															<span className="text-xs text-secondary/55">
																{item.hint}
															</span>
														)}
													</a>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							))}
						</AnimatePresence>
					</div>

					{/* CTA Button */}
					<div className="hidden lg:block">
						<a
							href="/login"
							className="inline-flex items-center justify-center rounded-full bg-secondary px-5 py-2 text-sm font-medium text-tertiary transition-colors hover:bg-secondary/90"
						>
							Get Started
						</a>
					</div>

					{/* Mobile Menu Button */}
					<button
						type="button"
						className="lg:hidden p-2"
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						aria-label="Toggle menu"
					>
						{isMobileMenuOpen ? (
							<X className="w-6 h-6 text-secondary" />
						) : (
							<Menu className="w-6 h-6 text-secondary" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						className="lg:hidden mx-auto mt-2 max-w-6xl rounded-3xl border border-secondary/15 bg-card/95 shadow-[0_12px_40px_-20px_rgba(58,82,166,0.45)] backdrop-blur-xl"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
					>
						<div className="px-4 py-4 space-y-2">
							{navLinks.map((link) => (
								<div key={link.name}>
									{!link.href.startsWith("#") ? (
										<Link
											to={link.href.split("#")[0] as "/"}
											preload="intent"
											onClick={(e) => {
												if (link.dropdown) {
													e.preventDefault();
													setActiveDropdown(
														activeDropdown === link.name ? null : link.name,
													);
												} else {
													handleNavClick(e, link.href);
													setIsMobileMenuOpen(false);
												}
											}}
											className="py-2 text-secondary hover:text-secondary flex items-center justify-between"
										>
											<span>{link.name}</span>
											{link.dropdown && (
												<ChevronDown
													className={`w-4 h-4 transition-transform duration-200 ${
														activeDropdown === link.name ? "rotate-180" : ""
													}`}
												/>
											)}
										</Link>
									) : (
										<a
											href={link.href}
											onClick={(e) => {
												handleNavClick(e, link.href);
												setIsMobileMenuOpen(false);
											}}
											className="py-2 text-secondary hover:text-secondary flex items-center justify-between"
										>
											<span>{link.name}</span>
										</a>
									)}
									{link.dropdown && activeDropdown === link.name && (
										<motion.div
											className="pl-4 space-y-1"
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.2, ease: "easeOut" }}
										>
											{link.dropdown.map((item) => (
												<a
													key={item.name}
													href={item.href}
													onClick={(e) => {
														const hashOnly = item.href.startsWith("#");
														const samePageHash =
															item.href.includes("#") && item.href.startsWith(location.pathname);

														if (hashOnly || samePageHash) {
															handleNavClick(e, item.href);
														}
														setIsMobileMenuOpen(false);
														setActiveDropdown(null);
													}}
													className="flex items-center gap-2 py-1.5 text-sm text-secondary/75 hover:text-secondary/80"
												>
													{item.name}
												</a>
											))}
										</motion.div>
									)}
								</div>
							))}
							<a
								href="/login"
								onClick={(e) => handleNavClick(e, "/login")}
								className="block w-full mt-4 px-6 py-2.5 text-sm font-medium bg-secondary hover:bg-secondary/90 text-tertiary rounded-full text-center transition-colors"
							>
								Get Started
							</a>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
}
