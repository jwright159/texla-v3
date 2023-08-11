"use server"

import { Character } from "@prisma/client"
import { unsealCookie, sealCookie } from "../cookies-server"

export async function getCharacterId(userId: number): Promise<number>
{
	if (!userId) return 0

	const cookieData = await unsealCookie()
	if (!cookieData) return 0

	const { characterId } = cookieData

	if (!characterId || typeof characterId !== "number") return 0

	const character = await prisma.character.findUnique({
		where: {
			id: characterId
		}
	})
	if (!character || character.userId != userId) return 0

	return characterId
}

export async function setCharacter(character: Character)
{
	await sealCookie({
		characterId: character.id,
	})
}

export async function unsetCharacter()
{
	await sealCookie({
		characterId: undefined,
	})
}