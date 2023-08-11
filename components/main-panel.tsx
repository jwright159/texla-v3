import { ReactNode } from "react"

export default async function MainPanel({
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