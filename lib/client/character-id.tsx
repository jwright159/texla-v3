"use client"

import { useRouter } from "next/navigation"
import { ReactNode, createContext, useContext, useEffect, useState, useTransition } from "react"
import { useReferrer } from "../client/referrer"
import { loginCharacter, registerCharacter, deleteCharacter } from "../server/character"
import { usePlayerUser } from "./user"
import { filterErrors } from "./context"
import { useUserId } from "./user-id"
import { getCharacterId, setCharacter, unsetCharacter } from "../server/character-id"

const CharacterIdContext = createContext<number| null>(null)
const SetCharacterIdContext = createContext((id: number) => {})
export const useCharacterId = () => useContext(CharacterIdContext)
export function useLoginCharacter()
{
	const router = useRouter()
	const referrer = useReferrer()

	const setCharacterId = useContext(SetCharacterIdContext)
	
	const [errorText, setErrorText] = useState("")
	const [isPending, startTransition] = useTransition()

	const user = usePlayerUser()!

	function login(characterId: number)
	{
		startTransition(async () =>
		{
			const character = filterErrors(await loginCharacter(characterId), setErrorText)
			if (!character) return
			
			setErrorText("")
			await setCharacter(character)
			setCharacterId(character.id)
			router.push(referrer)
		})
	}

	function register(characterName: string)
	{
		startTransition(async () =>
		{
			const character = filterErrors(await registerCharacter(user, characterName), setErrorText)
			if (!character) return
			
			setErrorText("")
			await setCharacter(character)
			setCharacterId(character.id)
			router.push(referrer)
		})
	}

	return {isPending, errorText, login, register}
}
export function useLogoutCharacter()
{
	const setCharacterId = useContext(SetCharacterIdContext)
	
	const [isPending, startTransition] = useTransition()

	function logout()
	{
		startTransition(async () =>
		{
			await unsetCharacter()
			setCharacterId(0)
		})
	}

	return {isPending, logout}
}
export function useDeleteCharacter(): [boolean, typeof del]
{
	const setCharacterId = useContext(SetCharacterIdContext)
	
	const [isPending, startTransition] = useTransition()

	function del(id: number)
	{
		startTransition(async () =>
		{
			await deleteCharacter(id)
			await unsetCharacter()
			setCharacterId(0)
		})
	}

	return [isPending, del]
}

export function CharacterIdProvider({
	children,
}: {
	children: ReactNode,
})
{
	const userId = useUserId()
	const [characterId, setCharacterId] = useState<number | null>(null)

	useEffect(() => {if (userId) (async () => setCharacterId(await getCharacterId(userId)))()}, [userId])

	return (
		<CharacterIdContext.Provider value={characterId}>
			<SetCharacterIdContext.Provider value={setCharacterId}>
				{children}
			</SetCharacterIdContext.Provider>
		</CharacterIdContext.Provider>
	)
}