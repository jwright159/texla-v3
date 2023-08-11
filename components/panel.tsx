import { ReactNode } from "react"

export default function Panel({
	children,
	title,
}: {
	children: ReactNode,
	title: string,
})
{
	return (
		<div>
			<h1>{title}</h1>
			{children}
		</div>
	)
}

export function MainPanel({
	children,
	title,
}: {
	children: ReactNode,
	title: string,
})
{
	return (
		<main>
			<Panel title={title}>
				{children}
			</Panel>
		</main>
	)
}