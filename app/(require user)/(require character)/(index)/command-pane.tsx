"use client"

import { fetchCharacter } from "@/lib/client/character"
import { useWebSocket } from "@/lib/client/websocket"
import { CommandEvent, EchoEvent, HelpEvent, JoinClientEvent, JoinServerEvent, LeaveClientEvent, LeaveServerEvent, SayEvent, UnknownCommandEvent, useEvent } from "@/lib/websocket-events"
import { useRef, useEffect, useState, ReactElement, ReactNode, useCallback, DependencyList } from "react"
import styles from "./command-pane.module.css"
import pageStyles from "./page.module.css"
import InputBox from "./input-box"

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
		setNodes(nodes => [...nodes, <div key={nodeCount.current}>{item}</div>])
		nodeCount.current++
	}, [])

	return [nodes, addNode] as const
}

function useSocketWithCommands(addNode: (node: ReactNode) => void)
{
	const socket = useWebSocket()

	useEvent(socket, UnknownCommandEvent, ({command}) => addNode(`Unknown command: ${command}`))

	useEvent(socket, EchoEvent, ({text}) => addNode(text))

	useEvent(socket, SayEvent, ({speakerId, text}) => {fetchCharacter(socket, speakerId).then(character => addNode(`[${character?.name}] ${text}`))})

	useEvent(socket, HelpEvent, ({commands}) => addNode(<span className={styles.help}>{commands.join(" ")}</span>))

	useEvent(socket, JoinServerEvent, ({id}) => {fetchCharacter(socket, id).then(character => addNode(`${character?.name} joined`))})

	useEvent(socket, LeaveServerEvent, ({id}) => {fetchCharacter(socket, id).then(character => addNode(`${character?.name} left`))})

	useEffect(() =>
	{
		{
			socket.emit(JoinClientEvent)
		}

		return () =>
		{
			socket.emit(LeaveClientEvent)
		}
	}, [socket])

	return socket
}

function useScrollToRef<T extends HTMLElement>(deps: DependencyList)
{
	const scrollTo = useRef<T>(null)
	useEffect(() => scrollTo.current!.scrollIntoView(), deps)
	return scrollTo
}