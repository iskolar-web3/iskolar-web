import { schools } from "@/components/landing/schools";

/**
 * One centred row of school logos for the Hero, in their own colors,
 * styled to match the "Trusted by" strip below it.
 */
export function SchoolSeals() {
	return (
		<div>
			<p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-secondary/45">
				Where our students come from
			</p>
			{/* Spread edge to edge across the hero width, one row from phones up */}
			<ul className="flex w-full flex-nowrap items-center justify-between gap-x-1.5">
				{schools.map((school) => (
					<li key={school.id} title={school.name} className="group shrink-0">
						<img
							src={school.logo}
							alt={school.name}
							className="h-8 w-8 object-contain transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 motion-reduce:transition-none sm:h-11 sm:w-11 lg:h-14 lg:w-14"
						/>
					</li>
				))}
			</ul>
		</div>
	);
}
