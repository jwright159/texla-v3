"use client"

import { fetchGameObject } from "@/lib/client/game-object"
import { useWebSocket } from "@/lib/client/websocket"
import { CommandEvent, CreateEvent, DeleteEvent, EchoEvent, HelpEvent, IdNaNError, JoinEvent, LeaveEvent, NotPlayingError, ObjectBeingPlayedError, ObjectNotEmptyError, ObjectNotFoundError, PermissionError, SayEvent, UnknownCommandError, useEvent } from "@/lib/websocket-events"
import { useRef, useEffect, useState, ReactElement, ReactNode, useCallback, DependencyList } from "react"
import styles from "./command-pane.module.css"
import pageStyles from "./page.module.css"
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
					addNode(<span className={styles.command}>&gt;{command}</span>)
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
	const addErrorNode = (node: ReactNode) => addNode(<span className={styles.error}>{node}</span>)

	const socket = useWebSocket()

	useEvent(socket, EchoEvent, ({text}) => addNode(text))

	useEvent(socket, SayEvent, ({speakerId, text}) => {fetchGameObject(socket, speakerId).then(character => addNode(`[${getDisplayName(character)}] ${text}`))})

	useEvent(socket, HelpEvent, ({commands}) => addNode(<span className={styles.help}>{commands.join(" ")}</span>))

	useEvent(socket, JoinEvent, ({id}) => {fetchGameObject(socket, id).then(character => addNode(`${getDisplayName(character)} joined`))})

	useEvent(socket, LeaveEvent, ({id}) => {fetchGameObject(socket, id).then(character => addNode(`${getDisplayName(character)} left`))})

	useEvent(socket, CreateEvent, ({id}) => addNode(`Created object with ID #${id}`))

	useEvent(socket, DeleteEvent, ({id}) => addNode(`Deleted object with ID #${id}`))

	useEvent(socket, UnknownCommandError, ({command}) => addErrorNode(`Unknown command "${command}"`))

	useEvent(socket, NotPlayingError, () => addErrorNode("Not playing - use switch command"))

	useEvent(socket, IdNaNError, ({id}) => addErrorNode(`ID "${id}" is not a number`))

	useEvent(socket, ObjectBeingPlayedError, ({id}) => addErrorNode(`Object #${id} is being played`))

	useEvent(socket, ObjectNotFoundError, ({id}) => addErrorNode(`No object with ID #${id}`))

	useEvent(socket, PermissionError, ({id}) => addErrorNode(`You do not own object ${id}`))

	useEvent(socket, ObjectNotEmptyError, ({id}) => addErrorNode(`Object ${id} contains other objects`))

	return socket
}

function useScrollToRef<T extends HTMLElement>(deps: DependencyList)
{
	const scrollTo = useRef<T>(null)
	useEffect(() => scrollTo.current!.scrollIntoView(), deps)
	return scrollTo
}