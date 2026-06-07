import { Link, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const homeLinks = [
	{
		name: "Home",
		href: "/",
		dropdown: [
			{ name: "Home", href: "#home" },
			{ name: "How it works", href: "#how-it-works" },
			{ name: "Roadmap", href: "#roadmap" },
			{ name: "Ecosystem", href: "#ecosystem" },
			{ name: "FAQs", href: "#faqs" },
		],
	},
	{
		name: "About",
		href: "/about",
		dropdown: [
			{ name: "Company Overview", href: "/about#company-overview" },
			{ name: "Mission & Vision", href: "/about#mission-vision" },
			{ name: "Partnerships", href: "/about#partnerships" },
			{ name: "Our Team", href: "/about#team" },
		],
	},
];

const aboutLinks = [
	{
		name: "Home",
		href: "/",
		dropdown: [
			{ name: "Home", href: "/#home" },
			{ name: "How it works", href: "/#how-it-works" },
			{ name: "Roadmap", href: "/#roadmap" },
			{ name: "Ecosystem", href: "/#ecosystem" },
			{ name: "FAQs", href: "/#faqs" },
		],
	},
	{
		name: "About",
		href: "/about",
		dropdown: [
			{ name: "Company Overview", href: "#company-overview" },
			{ name: "Mission & Vision", href: "#mission-vision" },
			{ name: "Partnerships", href: "#partnerships" },
			{ name: "Our Team", href: "#team" },
		],
	},
];

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
		<nav
			className={`fixed top-0 w-full z-50 transition-all duration-300 ${
				isScrolled
					? "bg-card/90 shadow-lg shadow-secondary/10 border-b border-secondary/15"
					: "bg-transparent border-b border-transparent"
			}`}
			style={{ backdropFilter: isScrolled ? "blur(12px)" : "none" }}
		>
			<div className="px-4 sm:px-12 lg:px-26">
				<div className="flex items-center justify-between h-16 lg:h-20">
					{/* Logo */}
					<a href="/#home" className="flex items-center gap-2">
						<div className="w-25 h-10 md:w-34 md:h-14 flex items-center justify-center">
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
											className={`relative flex items-center gap-1 text-md text-secondary transition-colors hover:text-secondary/80 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-secondary/40 after:transition-transform after:duration-300 hover:after:scale-x-100 motion-reduce:after:transition-none ${activeDropdown === link.name ? "text-secondary/80 after:scale-x-100" : ""}`}
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
											className="relative flex items-center gap-1 text-md text-secondary transition-colors hover:text-secondary/80 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-secondary/40 after:transition-transform after:duration-300 hover:after:scale-x-100 motion-reduce:after:transition-none"
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
												className="absolute top-full left-0 mt-2 w-56 bg-card rounded-md shadow-lg shadow-secondary/10 border border-secondary/15 py-2"
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
														className="flex items-center justify-between px-4 py-2 text-sm text-secondary transition-colors hover:bg-secondary/10"
													>
														{item.name}
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
							className="inline-flex items-center justify-center text-sm px-6 py-2 bg-transparent border-2 border-secondary hover:bg-secondary text-secondary hover:text-tertiary rounded-md transition-colors"
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
						className="lg:hidden bg-card border-t border-secondary/15"
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
								className="block w-full mt-4 px-6 py-2 text-sm bg-secondary hover:bg-secondary/80 text-tertiary rounded-md text-center transition-colors"
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
