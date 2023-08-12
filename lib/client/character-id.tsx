"use client"

import { ReactNode, createContext, useContext, useState, useTransition } from "react"
import { useRedirectToReferrer } from "./referrer"
import { DeleteCharacterRequest, RegisterCharacterRequest } from "../websocket-requests"
import { useWebSocketTransition } from "./context"

const CharacterIdContext = createContext<number>(0)
const SetCharacterIdContext = createContext((id: number) => {})
export const useCharacterId = () => useContext(CharacterIdContext)

function useFinishSelectCharacter(): [boolean, string, ({}: {}, id: number) => void]
{
	const redirect = useRedirectToReferrer()

	const [errorText, setErrorText] = useState("")
	const [isPending, startTransition] = useTransition()
	const [isRedirecting, setIsRedirecting] = useState(false)
	const setCharacterId = useContext(SetCharacterIdContext)

	async function select({}: {}, id: number)
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

	return [isPending || isRedirecting, errorText, (args, id) => startTransition(() => select(args, id))]
}

export function useSelectCharacter()
{
	const [isPending, errorText, selectCharacter] = useFinishSelectCharacter()
	return {isPending, errorText, selectCharacter: (id: number) => selectCharacter({}, id)}
}

export function useRegisterCharacter()
{
	const [isSelectPending, selectErrorText, selectCharacter] = useFinishSelectCharacter()
	const [isRegPending, regErrorText, register] = useWebSocketTransition(RegisterCharacterRequest, selectCharacter)

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
	const [isDelPending, delErrorText, del] = useWebSocketTransition(DeleteCharacterRequest, () => selectCharacter({}, 0))

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
		<CharacterIdContext.Provider value={characterId}>
			<SetCharacterIdContext.Provider value={setCharacterId}>
				{children}
			</SetCharacterIdContext.Provider>
		</CharacterIdContext.Provider>
	)
}