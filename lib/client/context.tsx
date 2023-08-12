"use client"

import { WebSocketRequest, emit } from "../websocket-requests"
import { useWebSocket } from "./websocket"
import { useCallback, useState, useSyncExternalStore } from "react"

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