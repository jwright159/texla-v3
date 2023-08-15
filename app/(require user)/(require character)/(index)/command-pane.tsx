"use client"

import { fetchCharacter } from "@/lib/client/character"
import { useWebSocket } from "@/lib/client/websocket"
import { ClientSocket, CommandEvent, EchoEvent, HelpEvent, JoinClientEvent, JoinServerEvent, LeaveClientEvent, LeaveServerEvent, SayEvent, UnknownCommandEvent, useEvent } from "@/lib/websocket-events"
import { useRef, useEffect, useState, ReactElement, ReactNode, useCallback } from "react"
import styles from "./command-pane.module.css"
import pageStyles from "./page.module.css"

export default function CommandPane()
{
	const [nodes, addNode] = useNodeList()

	const socket = useWebSocket()
	useSocketCommands(socket, addNode)

	const scrollTo = useRef<HTMLDivElement>(null)
	useEffect(() => scrollTo.current!.scrollIntoView(), [nodes])

	const [input, setInput] = useState("")

	function sendCommand()
	{
		if (!input) return
		addNode(<span className={styles.command}>&gt;{input}</span>)
		socket.emit(CommandEvent, {command: input})
		setInput("")
	}

	return (
		<div className={styles.messages}>
			<div className={`${styles.gameBox} ${pageStyles.bordered}`}>
				<ul className={styles.nodes}>
					{nodes.map(node => <li key={node.key} className={styles.node}>{node}</li>)}
				</ul>
				<div ref={scrollTo}></div>
			</div>

			<div className={styles.inputWrapper}>
				<input
					value={input}
					onChange={event => setInput(event.target.value)}
					onKeyDown={event =>
					{
						if (event.key === "Enter")
						{
							event.preventDefault()
							sendCommand()
						}
					}}
					className={`${styles.input} ${pageStyles.bordered}`}
					placeholder="Input command..."
				></input>
				<button
					className={styles.submitButton}
					onClick={sendCommand}
				>→</button>
			</div>
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

function useSocketCommands(socket: ClientSocket, addNode: (node: ReactNode) => void)
{
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
}