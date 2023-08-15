"use client"

import { MainPanel } from "@/components/panel"
import { usePlayerUser } from "@/lib/client/user"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"

export default function LoginRedirector({
	children
}: {
	children: ReactNode
})
{
	const router = useRouter()
	const user = usePlayerUser()

	useEffect(() => 
	{
		if (user === undefined)
			router.push("/login")
	}, [router, user])

	return user ? children : (
		<MainPanel title="Loading">
			<p>Loading user...</p>
		</MainPanel>
	)
}