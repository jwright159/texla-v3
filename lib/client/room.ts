"use client"

import { Room } from "../context"
import { usePlayerCharacter } from "./character"
import { createCache } from "./context"

export const useRoom = createCache<Room>("room")

export const usePlayerRoom = () =>
{
	const character = usePlayerCharacter()
	const room = useRoom(character?.roomId ?? 0)
	return character ? room : undefined
}