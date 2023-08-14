"use client"

import { ReactNode, createContext, useContext, useState, useTransition } from "react"
import { useRedirectToReferrer } from "./referrer"
import { useWebSocketTransition } from "./context"
import { RegisterUserEvent, VerifyUserEvent } from "../websocket-events"

const UserIdContext = createContext<number>(0)
const SetUserIdContext = createContext<(id: number) => void>(() => {})
export const useUserId = () => useContext(UserIdContext)

function useFinishLogin()
{
	const redirect = useRedirectToReferrer()

	const [errorText, setErrorText] = useState("")
	const [isPending, startTransition] = useTransition()
	const setUserId = useContext(SetUserIdContext)

	async function finishLogin({username, password}: {username: string, password: string}, id: number)
	{
		const response = await fetch("/api/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
			}),
		})

		if (response.status === 200)
		{
			setErrorText("")
			setUserId(id)
			redirect()
		}
		else
		{
			setErrorText(await response.text())
		}
	}

	return [isPending, errorText, (args: {username: string, password: string}, id: number) => startTransition(() => finishLogin(args, id))] as const
}

function useFinishLogout()
{
	const redirect = useRedirectToReferrer()

	const [errorText, setErrorText] = useState("")
	const [isPending, startTransition] = useTransition()
	const [isRedirecting, setIsRedirecting] = useState(false)
	const setUserId = useContext(SetUserIdContext)

	async function finishLogout()
	{
		const response = await fetch("/api/logout", {
			method: "POST",
		})

		if (response.status === 200)
		{
			setErrorText("")
			setUserId(0)
			setIsRedirecting(true)
			redirect()
		}
		else
		{
			setErrorText(await response.text())
		}
	}

	return [isPending || isRedirecting, errorText, () => startTransition(() => finishLogout())] as const
}

export function useLoginUser()
{
	const [isLoginPending, loginErrorText, finishLogin] = useFinishLogin()
	const [isVerifyPending, verifyErrorText, login] = useWebSocketTransition(VerifyUserEvent, finishLogin)

	return {
		isPending: isVerifyPending || isLoginPending,
		errorText: verifyErrorText || loginErrorText,
		login: (username: string, password: string) => login({username, password})
	}
}

export function useRegisterUser()
{
	const [isLoginPending, loginErrorText, finishLogin] = useFinishLogin()
	const [isRegPending, regErrorText, register] = useWebSocketTransition(RegisterUserEvent, finishLogin)

	return {
		isPending: isRegPending || isLoginPending,
		errorText: regErrorText || loginErrorText,
		register: (username: string, password: string) => register({username, password})
	}
}

export function useLogoutUser()
{
	const [isPending, errorText, finishLogout] = useFinishLogout()
	return {isPending, errorText, logout: finishLogout}
}

export function UserIdProvider({
	children,
	initialId,
}: {
	children: ReactNode,
	initialId: number,
})
{
	const [userId, setUserId] = useState<number>(initialId)

	return (
		<UserIdContext.Provider value={userId}>
			<SetUserIdContext.Provider value={setUserId}>
				{children}
			</SetUserIdContext.Provider>
		</UserIdContext.Provider>
	)
}