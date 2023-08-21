"use client"

import { ReactNode, createContext, useContext, useState } from "react"
import { SwitchEvent, useEvent } from "../websocket-events"
import { useWebSocket } from "./websocket"

const PlayerIdContext = createContext<number>(0)
export const usePlayerId = () => useContext(PlayerIdContext)

export function PlayerIdProvider({
	children,
}: {
	children: ReactNode,
})
{
	const [playerId, setPlayerId] = useState<number>(0)

	const socket = useWebSocket()
	useEvent(socket, SwitchEvent, ({id}) => setPlayerId(id))

	return (
		<PlayerIdContext.Provider value={playerId}>
			{children}
		</PlayerIdContext.Provider>
	)
}