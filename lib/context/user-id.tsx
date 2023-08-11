"use client"

import { useRouter } from "next/navigation"
import { ReactNode, createContext, useContext, useEffect, useState, useTransition } from "react"
import { useReferrer } from "../referrer"
import { loginUser, registerUser } from "./user-server"
import { filterErrors } from "./context"
import { setUser, unsetUser, getUserId } from "./user-id-server"

const UserIdContext = createContext<number| null>(null)
const SetUserIdContext = createContext((id: number) => {})
export const useUserId = () => useContext(UserIdContext)
export function useLoginUser()
{
	const router = useRouter()
	const referrer = useReferrer()

	const setUserId = useContext(SetUserIdContext)
	
	const [errorText, setErrorText] = useState("")
	const [isPending, startTransition] = useTransition()

	function login(username: string, password: string)
	{
		startTransition(async () =>
		{
			const user = filterErrors(await loginUser(username, password), setErrorText)
			if (!user) return
			
			setErrorText("")
			await setUser(user)
			setUserId(user.id)
			router.push(referrer)
		})
	}

	function register(username: string, password: string)
	{
		startTransition(async () =>
		{
			const user = filterErrors(await registerUser(username, password), setErrorText)
			if (!user) return;
			
			setErrorText("")
			await setUser(user)
			setUserId(user.id)
			router.push(referrer)
		})
	}

	return {isPending, errorText, login, register}
}
export function useLogoutUser()
{
	const setUserId = useContext(SetUserIdContext)
	
	const [isPending, startTransition] = useTransition()

	function logout()
	{
		startTransition(async () =>
		{
			await unsetUser()
			setUserId(0)
		})
	}

	return {isPending, logout}
}

export function UserIdProvider({
	children,
}: {
	children: ReactNode,
})
{
	const [userId, setUserId] = useState<number | null>(null)

	useEffect(() => void (async () => setUserId(await getUserId()))(), [])

	return (
		<UserIdContext.Provider value={userId}>
			<SetUserIdContext.Provider value={setUserId}>
				{children}
			</SetUserIdContext.Provider>
		</UserIdContext.Provider>
	)
}