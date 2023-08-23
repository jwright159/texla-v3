"use client"

import { fetchGameObject } from "@/lib/client/game-object"
import { useWebSocket } from "@/lib/client/websocket"
import { CommandEvent, CreateEvent, DeleteEvent, EchoEvent, HelpEvent, IdNaNError, JoinEvent, LeaveEvent, ListPlayersEvent, NotPlayingError, ObjectBeingPlayedError, ObjectNotEmptyError, ObjectNotFoundError, PermissionError, SayEvent, UnknownCommandError, useEvent } from "@/lib/websocket-events"
import { useRef, useEffect, useState, ReactElement, ReactNode, useCallback, DependencyList } from "react"
import styles from "./command-pane.module.css"
import pageStyles from "./page.module.css"
import messageStyles from "./messages.module.css"
import InputBox from "./input-box"
import { GameObject } from "@/lib/context"

export default function CommandPane()
{
	const [nodes, addNode] = useNodeList()
	
	const scrollTo = useScrollToRef<HTMLDivElement>([nodes])

	const socket = useSocketWithCommands(addNode)

	return (
		<div className={styles.messages}>
			<div className={`${styles.gameBox} ${pageStyles.bordered}`}>
				<ul className={styles.nodes}>
					{nodes.map(node => <li key={node.key} className={styles.node}>{node}</li>)}
				</ul>
				<div ref={scrollTo}></div>
			</div>

			<InputBox
				onSend={(command) =>
				{
					addNode(<span className={messageStyles.command}>&gt;{command}</span>)
					socket.emit(CommandEvent, {command})
				}}
			/>
		</div>
	)
}

function useNodeList()
{
	const [nodes, setNodes] = useState<ReactElement[]>([])
	const nodeCount = useRef(0)

	const addNode = useCallback((item: ReactNode) =>
	{
		setNodes(nodes => [...nodes, <div key={nodeCount.current++}>{item}</div>])
	}, [])

	return [nodes, addNode] as const
}

const getDisplayName = (gameObject: GameObject | null) => gameObject?.props["name"] ?? `#${gameObject?.id}`

function useSocketWithCommands(addNode: (node: ReactNode) => void)
{
	const addStyledNode = (style: string, node: ReactNode) => addNode(<span className={messageStyles[style]}>{node}</span>)

	const socket = useWebSocket()

	useEvent(socket, EchoEvent, ({text}) => addStyledNode("command", text))

	useEvent(socket, SayEvent, ({speakerId, text}) => {fetchGameObject(socket, speakerId).then(player => addNode(`[${getDisplayName(player)}] ${text}`))})

	useEvent(socket, HelpEvent, ({commands}) => addStyledNode("help", commands.join(" ")))

	useEvent(socket, JoinEvent, ({id}) => {fetchGameObject(socket, id).then(player => addNode(`-- ${getDisplayName(player)} joined --`))})

	useEvent(socket, LeaveEvent, ({id}) => {fetchGameObject(socket, id).then(player => addNode(`-- ${getDisplayName(player)} left --`))})

	useEvent(socket, ListPlayersEvent, ({ids}) => {Promise.all(ids.map(id => fetchGameObject(socket, id))).then(players => addStyledNode("command", "Possible players: " + players.map(player => player ? player.props["name"] ? `${player.props["name"]} (#${player.id})` : `#${player.id}` : "#null").join(", ")))})

	useEvent(socket, CreateEvent, ({id}) => addStyledNode("command", `Created object with ID #${id}`))

	useEvent(socket, DeleteEvent, ({id}) => addStyledNode("command", `Deleted object with ID #${id}`))

	useEvent(socket, UnknownCommandError, ({command}) => addStyledNode("error", `Unknown command "${command}"`))

	useEvent(socket, NotPlayingError, () => addStyledNode("error", "Not playing, use switch command to select a player"))

	useEvent(socket, IdNaNError, ({id}) => addStyledNode("error", `ID "${id}" is not a number`))

	useEvent(socket, ObjectBeingPlayedError, ({id}) => addStyledNode("error", `Object #${id} is being played`))

	useEvent(socket, ObjectNotFoundError, ({id}) => addStyledNode("error", `No object with ID #${id}`))

	useEvent(socket, PermissionError, ({id}) => addStyledNode("error", `You do not own object ${id}`))

	useEvent(socket, ObjectNotEmptyError, ({id}) => addStyledNode("error", `Object ${id} contains other objects`))

	return socket
}

function useScrollToRef<T extends HTMLElement>(deps: DependencyList)
{
	const scrollTo = useRef<T>(null)
	useEffect(() => scrollTo.current!.scrollIntoView(), deps)
	return scrollTo
}