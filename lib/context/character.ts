"use client"

import { useCharacterId } from "./character-id"
import { createCache } from "./context"
import { Character } from "@prisma/client"

export const [useCharacter, useSetCharacter] = createCache<Character>("character")

export const usePlayerCharacter = () =>
{
	const characterId = useCharacterId()
	const character = useCharacter(characterId)
	return characterId !== 0 ? character : undefined
}