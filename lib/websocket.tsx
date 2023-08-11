"use client"

import { useState, useEffect, ReactNode, createContext, useContext } from "react"
import { io, Socket } from "socket.io-client"
import { useUserId } from "./context/user-id"
import MainPanel from "@/components/main-panel"

const WebSocketContext = createContext<Socket | null>(null)

export const useWebSocket = () => useContext(WebSocketContext)!

export function WebSocketProvider({
	children,
}: {
	children: ReactNode,
})
{
	const [socket, setSocket] = useState<Socket | null>(null)
	const [connected, setConnected] = useState(false)
	const userId = useUserId()

	useEffect(() =>
	{
		const socket = io()
		setSocket(socket)

		socket.on("connect", () =>
		{
			console.log(`Connected ${socket.id}`)
			setConnected(true)
		})
		socket.on("disconnect", reason =>
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