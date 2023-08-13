"use client"

import { WebSocketRequest, emit } from "../websocket-requests"
import { useWebSocket } from "./websocket"
import { useCallback, useState, useSyncExternalStore } from "react"

export function createCache<T extends {id: number}>(table: string): [typeof useCachedValue, typeof useSetCachedValue]
{
	const cache: Record<number, T | null> = {}
	const cacheSubscribers: Record<number, number> = {}

	function useCachedValue(id: number | null): T | null
	{
		const socket = useWebSocket()

		function incrementSubscribers(id: number, cacheResult: (args: {id: number, value: T | null}) => void)
		{
			cacheSubscribers[id] = (cacheSubscribers[id] ?? 0) + 1
			if (cacheSubscribers[id] === 1)
			{
				socket.on(`update-${table}-${id}`, cacheResult)
				socket.emit(`subscribe-${table}`, id)
			}
		}

		function decrementSubscribers(id: number, cacheResult: (args: {id: number, value: T | null}) => void)
		{
			cacheSubscribers[id] = (cacheSubscribers[id] ?? 0) - 1
			if (cacheSubscribers[id] === 0)
			{
				socket.off(`update-${table}-${id}`, cacheResult)
				socket.emit(`unsubscribe-${table}`, id)
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
					socket.emit(`update-${table}`, value, () => resolve())
				})
		}

		return setCachedValue
	}

	return [useCachedValue, useSetCachedValue]
}

export function useWebSocketTransition<TArgs, TResponse>(request: WebSocketRequest<TArgs, TResponse>, onSuccess?: (args: TArgs, response: TResponse) => void): [boolean, string, (args: TArgs) => void]
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

		emit(socket, request, args, respond)
	}

	return [isPending, errorText, startTransition]
}