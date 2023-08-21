"use client"

import { usePlayerId } from "./player-id"
import { createCache } from "./context"
import { GameObject } from "../context"

export const [useGameObject, fetchGameObject] = createCache<GameObject>("gameObject")

export const usePlayer = () =>
{
	const playerId = usePlayerId()
	const player = useGameObject(playerId)
	return playerId !== 0 ? player : undefined
}

export const usePlayerLocation = () =>
{
	const locationId = usePlayer()?.locationId
	const location = useGameObject(locationId ?? 0)
	return locationId !== 0 ? location : undefined
}