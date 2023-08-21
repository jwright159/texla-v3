"use client"

import { useState, useEffect, ReactNode, createContext, useContext } from "react"
import { io } from "socket.io-client"
import { useUserId } from "./user-id"
import { MainPanel } from "@/components/panel"
import { ClientSocket, ConnectEvent, DisconnectEvent } from "../websocket-events"

const WebSocketContext = createContext<ClientSocket | null>(null)

export const useWebSocket = () => useContext(WebSocketContext)!

export function WebSocketProvider({
	children,
}: {
	children: ReactNode,
})
{
	const [socket, setSocket] = useState<ClientSocket | null>(null)
	const [connected, setConnected] = useState(false)
	const userId = useUserId()

	useEffect(() =>
	{
		const socket = new ClientSocket(io())
		setSocket(socket)

		socket.on(ConnectEvent, () =>
		{
			console.log(`Connected ${socket.id}`)
			setConnected(true)
		})
		socket.on(DisconnectEvent, reason =>
		{
			console.log(`Disconnected, ${reason}`)
			setConnected(false)
		})

		return () =>
		{
			socket.disconnect()
		}
	}, [userId])

	return (socket && connected ?
		<WebSocketContext.Provider value={socket}>
			{children}
		</WebSocketContext.Provider>
		:
		<MainPanel title="Please wait">
			<p>Connecting to server...</p>
		</MainPanel>
	)
}