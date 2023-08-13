"use client"

import { usePlayerCharacter } from "./character"
import { createCache } from "./context"
import { Room as RoomModel } from "@prisma/client"

export interface Room extends RoomModel {
	characterIds: number[],
}

export const [useRoom, useSetRoom] = createCache<Room>("room")

export const usePlayerRoom = () =>
{
	const character = usePlayerCharacter()
	const room = useRoom(character?.roomId ?? 0)
	return character ? room : undefined
}