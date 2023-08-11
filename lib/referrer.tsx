"use client"

import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

const defaultReferrer = "/overview"

const ReferrerContext = createContext(defaultReferrer)
export const useReferrer = () => useContext(ReferrerContext)

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
			pathname === "/register-character" ||
			pathname === "/register-session"
		))
			setReferrer(pathname)
	}, [pathname])

	return (
		<>
			<ReferrerContext.Provider value={referrer}>
				{children}
			</ReferrerContext.Provider>
		</>
	)
}