"use client";

import { usePathname, useRouter } from "next/navigation";

type SideBarProps = {
	href: string;
	title: string;
	icon: React.ReactNode;
};

export const SidebarItem = ({ href, title, icon }: SideBarProps) => {
	const router = useRouter();
	const pathName = usePathname();
	const selected = pathName === href;

	return (
		<div
			className={`flex ${selected ? "text-[#6a51a6]" : "text-slate-500"} cursor-pointer  p-2 pl-8`}
			onClick={() => {
				router.push(href);
			}}
		>
			<div className="pr-2">{icon}</div>
			<div
				className={`font-bold ${selected ? "text-[#6a51a6]" : "text-slate-500"}`}
			>
				{title}
			</div>
		</div>
	);
};
