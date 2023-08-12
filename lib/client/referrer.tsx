"use client"

import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

const defaultReferrer = "/"

const ReferrerContext = createContext(defaultReferrer)
export const useReferrer = () => useContext(ReferrerContext)

export function useRedirectToReferrer()
{
	const router = useRouter()
	const referrer = useReferrer()
	return () => router.push(referrer)
}

export function ReferrerProvider({
	children,
}: {
	children: ReactNode,
})
{
	const pathname = usePathname()
	const [referrer, setReferrer] = useState(defaultReferrer)

	useEffect(() =>
	{
		if (!(
			pathname === "/login" ||
			pathname === "/register" ||
			pathname === "/select-character" ||
			pathname === "/register-character"
		))
			setReferrer(pathname)
	}, [pathname])

	return (
		<ReferrerContext.Provider value={referrer}>
			{children}
		</ReferrerContext.Provider>
	)
}