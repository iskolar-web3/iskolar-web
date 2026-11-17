import { Facebook, Instagram, Linkedin } from "lucide-react";
import type { ComponentType } from "react";
import type { SocialId } from "@/components/landing/socials";

type IconProps = { className?: string; strokeWidth?: number };

// lucide has no X, Threads or Substack marks, so these are filled brand glyphs.
function XIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	);
}

// lucide's group icons show two people, so this draws three in the same
// outline style: one in front, one on each side.
function UsersThreeIcon({ className, strokeWidth = 2 }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<circle cx="12" cy="8" r="3.25" />
			<path d="M6.5 21v-1.5A4.5 4.5 0 0 1 11 15h2a4.5 4.5 0 0 1 4.5 4.5V21" />
			<circle cx="4.5" cy="9.5" r="2.25" />
			<path d="M2 20v-1.2A3.8 3.8 0 0 1 5.8 15" />
			<circle cx="19.5" cy="9.5" r="2.25" />
			<path d="M22 20v-1.2A3.8 3.8 0 0 0 18.2 15" />
		</svg>
	);
}

function ThreadsIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" />
		</svg>
	);
}

function SubstackIcon({ className }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
		</svg>
	);
}

// Filled glyphs carry far more ink than lucide's outlines, so decorative uses
// (the oversized watermark) need to fade them further to read alike.
export const filledSocialIds: ReadonlySet<SocialId> = new Set([
	"x",
	"threads",
	"substack",
]);

export const socialIcons: Record<SocialId, ComponentType<IconProps>> = {
	facebook: Facebook,
	community: UsersThreeIcon,
	instagram: Instagram,
	linkedin: Linkedin,
	x: XIcon,
	threads: ThreadsIcon,
	substack: SubstackIcon,
};
