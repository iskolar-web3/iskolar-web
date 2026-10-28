import { schools } from "@/components/landing/schools";

/**
 * One centred row of school logos for the Hero, in their own colours,
 * styled to match the "Trusted by" strip below it.
 */
export function SchoolSeals() {
	return (
		<div>
			<p className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-secondary/45">
				Where our students come from:
			</p>
			{/* Sized so all nine stay on one row from phones up */}
			<ul className="flex flex-nowrap items-start justify-center gap-x-1.5 sm:gap-x-3 lg:gap-x-2 xl:gap-x-4">
				{schools.map((school) => (
					<li
						key={school.id}
						className="group flex w-9 flex-col items-center text-center sm:w-12 lg:w-14 xl:w-16"
					>
						<img
							src={school.logo}
							alt={school.name}
							className="h-9 w-9 object-contain transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 motion-reduce:transition-none sm:h-12 sm:w-12 lg:h-14 lg:w-14"
						/>
					</li>
				))}
			</ul>
		</div>
	);
}
