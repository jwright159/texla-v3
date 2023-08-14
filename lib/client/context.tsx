"use client"

import { ClientWebSocketEvent, SubscribeEvent, UnsubscribeEvent, UpdateEvent } from "../websocket-events"
import { useWebSocket } from "./websocket"
import { useCallback, useState, useSyncExternalStore } from "react"

export function createCache<T extends {id: number}>(table: string)
{
	const cache: Record<number, T | null> = {}
	const cacheSubscribers: Record<number, number> = {}

	function useCachedValue(id: number | null): T | null
	{
		const socket = useWebSocket()

		function incrementSubscribers(id: number, cacheResult: ReturnType<typeof UpdateEvent<T>>["_listener"])
		{
			cacheSubscribers[id] = (cacheSubscribers[id] ?? 0) + 1
			if (cacheSubscribers[id] === 1)
			{
				socket.on(UpdateEvent<T>(table, id), cacheResult)
				socket.emit(SubscribeEvent(table), {id})
			}
		}

		function decrementSubscribers(id: number, cacheResult: ReturnType<typeof UpdateEvent<T>>["_listener"])
		{
			cacheSubscribers[id] = (cacheSubscribers[id] ?? 0) - 1
			if (cacheSubscribers[id] === 0)
			{
				socket.off(UpdateEvent<T>(table, id), cacheResult)
				socket.emit(UnsubscribeEvent(table), {id})
			}
		}

		const subscribe = useCallback((callback: () => void) =>
		{
			if (!id) return () => {}

			function cacheResult({
				id,
				value,
			}: {
				id: number,
				value: T | null,
			})
			{
				if (cache[id] && JSON.stringify(value) === JSON.stringify(cache[id])) return
				cache[id] = value
				callback()
			}

			incrementSubscribers(id, cacheResult)
			return () => decrementSubscribers(id, cacheResult)
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
					//emitEvent(socket, UpdateEvent(table), {value}, () => resolve())
				})
		}

		return setCachedValue
	}

	return useCachedValue
}

export function useWebSocketTransition<TArgs, TResponse>(request: ClientWebSocketEvent<TArgs, TResponse>, onSuccess?: (args: TArgs, response: TResponse) => void)
{
	const socket = useWebSocket()
	const [isPending, setPending] = useState(false)
	const [errorText, setErrorText] = useState("")

	function startTransition(args: TArgs)
	{
		if (isPending) return "Transition still pending"
		setPending(true)

		function respond({
			body,
			error,
		}: {
			body?: TResponse,
			error?: string,
		})
		{
			setErrorText(error ?? "")
			setPending(false)
			if (!error && onSuccess)
				onSuccess(args, body!)
		}

		socket.emit(request, args, respond)
	}

	return [isPending, errorText, startTransition] as const
}