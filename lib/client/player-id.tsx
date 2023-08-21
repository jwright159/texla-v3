"use client"

import { ReactNode, createContext, useContext, useState, useTransition } from "react"
import { useRedirectToReferrer } from "./referrer"
import { DeleteCharacterEvent, RegisterCharacterEvent } from "../websocket-events"
import { useWebSocketTransition } from "./context"

const PlayerIdContext = createContext<number>(0)
const SetPlayerIdContext = createContext<(id: number) => void>(() => {})
export const usePlayerId = () => useContext(PlayerIdContext)

function useFinishSelectCharacter()
{
	const redirect = useRedirectToReferrer()

	const [errorText, setErrorText] = useState("")
	const [isPending, startTransition] = useTransition()
	const [isRedirecting, setIsRedirecting] = useState(false)
	const setCharacterId = useContext(SetPlayerIdContext)

	async function select(args: object, id: number)
	{
		const response = await fetch("/api/select-character", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				id,
			}),
		})

		if (response.status === 200)
		{
			setErrorText("")
			setCharacterId(id)
			setIsRedirecting(true)
			redirect()
		}
		else
		{
			setErrorText(await response.text())
		}
	}

	return [isPending || isRedirecting, errorText, (args: object, id: number) => startTransition(() => select(args, id))] as const
}

export function useSelectCharacter()
{
	const [isPending, errorText, selectCharacter] = useFinishSelectCharacter()
	return {isPending, errorText, selectCharacter: (id: number) => selectCharacter({}, id)}
}

export function useRegisterCharacter()
{
	const [isSelectPending, selectErrorText, selectCharacter] = useFinishSelectCharacter()
	const [isRegPending, regErrorText, register] = useWebSocketTransition(RegisterCharacterEvent, selectCharacter)

	return {
		isPending: isRegPending || isSelectPending,
		errorText: regErrorText || selectErrorText,
		register: (name: string) => register({name})
	}
}

export function useLogoutCharacter()
{
	const [isPending, errorText, selectCharacter] = useFinishSelectCharacter()
	return {isPending, errorText, logout: () => selectCharacter({}, 0)}
}

export function useDeleteCharacter()
{
	const [isSelectPending, selectErrorText, selectCharacter] = useFinishSelectCharacter()
	const [isDelPending, delErrorText, del] = useWebSocketTransition(DeleteCharacterEvent, () => selectCharacter({}, 0))

	return {
		isPending: isDelPending || isSelectPending,
		errorText: delErrorText || selectErrorText,
		delete: del,
	}
}

export function CharacterIdProvider({
	children,
	initialId,
}: {
	children: ReactNode,
	initialId: number,
})
{
	const [characterId, setCharacterId] = useState<number>(initialId)

	return (
		<PlayerIdContext.Provider value={characterId}>
			<SetPlayerIdContext.Provider value={setCharacterId}>
				{children}
			</SetPlayerIdContext.Provider>
		</PlayerIdContext.Provider>
	)
}