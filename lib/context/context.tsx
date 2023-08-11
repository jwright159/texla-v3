"use client"

import { useWebSocket } from "../websocket"
import { useCallback, useSyncExternalStore } from "react"

export function createCache<T extends {id: number}>(table: string): [typeof useCachedValue, typeof useSetCachedValue]
{
	const cache: Record<number, T> = {}

	function useCachedValue(id: number | null): T | null
	{
		const socket = useWebSocket()

		const subscribe = useCallback((callback: () => void) =>
		{
			if (!id) return () => {}

			function cacheResult(value: T)
			{
				cache[value.id] = value
				callback()
			}

			socket.on(`update-${table}`, cacheResult)
			socket.emit(`subscribe-${table}`, id)

			return () =>
			{
				socket.off(`update-${table}`, cacheResult)
				socket.emit(`unsubscribe-${table}`, id)
			}
		}, [socket, id])

		function getSnapshot(): T | null
		{
			return cache[id ?? 0] ?? null
		}
		
		return useSyncExternalStore(subscribe, getSnapshot)
	}

	function useSetCachedValue()
	{
		const socket = useWebSocket()

		function setCachedValue(value: T)
		{
			return new Promise<void>(resolve => 
				{
					socket.emit(`update-${table}`, value, () => resolve())
				})
		}

		return setCachedValue
	}

	return [useCachedValue, useSetCachedValue]
}

export function filterErrors<T>(object: T | string, setErrorText: (text: string) => void)
{
	if (typeof object === "string")
	{
		setErrorText(object)
		return null
	}
	return object
}