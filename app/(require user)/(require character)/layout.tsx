"use client"

import { ReactNode } from "react"
import LoginCharacterRedirector from "./login-character-redirector"

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