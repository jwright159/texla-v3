"use client"

import { ClientSocket, ClientWebSocketEvent, FetchEvent, SubscribeEvent, UnsubscribeEvent, UpdateEvent } from "../websocket-events"
import { useWebSocket } from "./websocket"
import { useCallback, useState, useSyncExternalStore } from "react"

export function createCache<T extends {id: number}>(table: string)
{
	const cache: Record<number, T | null> = {}
	const cacheSubscriberCounts: Record<number, number> = {}
	const cacheCallbacks: Record<number, (() => void)[]> = {}

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
		if (cacheCallbacks[id]) cacheCallbacks[id].forEach(callback => callback())
	}

	function useCachedValue(id: number | null): T | null
	{
		const socket = useWebSocket()

		function incrementSubscribers(socket: ClientSocket, id: number, callback: () => void)
		{
			cacheSubscriberCounts[id] = (cacheSubscriberCounts[id] ?? 0) + 1
			if (cacheSubscriberCounts[id] === 1)
			{
				socket.on(UpdateEvent<T>(table, id), cacheResult)
				socket.emit(SubscribeEvent(table), {id})
				cacheCallbacks[id] = []
			}

			cacheCallbacks[id].push(callback)
		}

		function decrementSubscribers(socket: ClientSocket, id: number, callback: () => void)
		{
			cacheCallbacks[id].splice(cacheCallbacks[id].indexOf(callback), 1)

			cacheSubscriberCounts[id] = (cacheSubscriberCounts[id] ?? 0) - 1
			if (cacheSubscriberCounts[id] === 0)
			{
				socket.off(UpdateEvent<T>(table, id), cacheResult)
				socket.emit(UnsubscribeEvent(table), {id})
				delete cacheCallbacks[id]
			}
		}

		const subscribe = useCallback((callback: () => void) =>
		{
			if (!id) return () => {}

			incrementSubscribers(socket, id, callback)
			return () => decrementSubscribers(socket, id, callback)
		}, [socket, id])

		function getSnapshot(): T | null
		{
			return cache[id ?? 0] ?? null
		}
		
		return useSyncExternalStore(subscribe, getSnapshot)
	}

	async function fetchCachedValue(socket: ClientSocket, id: number | null)
	{
		if (!id) return null
		if (cacheSubscriberCounts[id]) return cache[id]

		const value = await new Promise<T | null>((resolve, reject) =>
		{
			socket.emit(FetchEvent<T>(table), {id}, (response) =>
			{
				if (response.error)
					reject(response.error)
				else
					resolve(response.body?.value ?? null)
			})
		})
		cacheResult({id, value})
		return value
	}

	/*
	function useSetCachedValue()
	{
		const socket = useWebSocket()

		function setCachedValue(value: T)
		{
			return new Promise<void>(resolve => 
				{
					emitEvent(socket, UpdateEvent(table), {value}, () => resolve())
				})
		}

		return setCachedValue
	}
	*/

	return [useCachedValue, fetchCachedValue] as const
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