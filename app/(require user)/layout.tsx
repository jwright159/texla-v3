"use client"

import { ReactNode } from "react"
import LoginRedirector from "./login-redirector"

export default function GameLoginLayout({
	children,
}: {
	children: ReactNode,
})
{
	return (
		<LoginRedirector>
			{children}
		</LoginRedirector>
	)
}