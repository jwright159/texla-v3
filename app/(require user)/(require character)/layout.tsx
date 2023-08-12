"use client"

import { MainPanel } from "@/components/panel"
import { usePlayerCharacter } from "@/lib/client/character"
import { usePlayerUser } from "@/lib/client/user"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"

export default function GameCharacterLoginLayout({
	children,
}: {
	children: ReactNode,
})
{
	return (
		<LoginCharacterRedirector>
			{children}
		</LoginCharacterRedirector>
	)
}

export function LoginCharacterRedirector({
	children
}: {
	children: ReactNode
})
{
	const router = useRouter()
	const user = usePlayerUser()
	const character = usePlayerCharacter()

	useEffect(() => 
	{
		if (user && character === undefined)
			router.push("/select-character")
	}, [user, character])

	return character ? children :
		<MainPanel title="Loading">
			<p>Loading {character ? "entity" : "character"}...</p>
		</MainPanel>
}