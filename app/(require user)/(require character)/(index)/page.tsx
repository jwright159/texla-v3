"use client"

import LogoutButton from "../../../login/logout-button"
import LogoutCharacterButton from "../../select-character/logout-character-button"
import { fetchCharacter, useCharacter, usePlayerCharacter } from "@/lib/client/character"
import { usePlayerRoom } from "@/lib/client/room"
import { ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from "react"
import styles from "./page.module.css"
import { fetchUser, usePlayerUser } from "@/lib/client/user"
import { useWebSocket } from "@/lib/client/websocket"
import { ClientSocket, CommandEvent, EchoEvent, HelpEvent, JoinClientEvent, JoinServerEvent, LeaveClientEvent, LeaveServerEvent, SayEvent, UnknownCommandEvent, useEvent } from "@/lib/websocket-events"

export default function Index()
{
	const user = usePlayerUser()!
	const character = usePlayerCharacter()!
	const room = usePlayerRoom()

	const [nodes, addNode] = useNodeList()

	const socket = useWebSocket()
	registerSocketCommands(socket, addNode)

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
		<main className={styles.main}>
			<h1 className={styles.header}>You are in {room?.name ?? "null"}</h1>

			<div className={styles.game}>
				<div className={styles.messages}>
					<div className={[styles.gameBox, styles.bordered].join(" ")}>
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
							className={[styles.input, styles.bordered].join(" ")}
							placeholder="Input command..."
						></input>
						<button
							className={styles.submitButton}
							onClick={sendCommand}
						>→</button>
					</div>
				</div>
				
				<div className={[styles.bordered, styles.characters].join(" ")}>
					<CharacterList/>
				</div>
			</div>

			<div>
				Logged in as {user.username} &nbsp; <LogoutButton/> &nbsp;
				Playing as {character.name} &nbsp; <LogoutCharacterButton/> &nbsp;
			</div>
		</main>
	)
}

function CharacterList()
{
	const room = usePlayerRoom()
	return (room ?
		<ul>
			{room.characterIds.map(characterId => <CharacterItem key={characterId} id={characterId}/>)}
		</ul>
	:
		"Nobody came."
	)
}

function CharacterItem({
	id,
}: {
	id: number,
})
{
	const character = useCharacter(id)
	return (
		<li>{character?.name ?? "Loading character..."}</li>
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

function registerSocketCommands(socket: ClientSocket, addNode: (node: ReactNode) => void)
{
	useEvent(socket, UnknownCommandEvent, ({command}) => addNode(`Unknown command: ${command}`))

	useEvent(socket, EchoEvent, ({text}) => addNode(text))

	useEvent(socket, SayEvent, ({speakerId, text}) => addNode(`[${speakerId}] ${text}`))

	useEvent(socket, HelpEvent, ({commands}) => addNode(<span className={styles.help}>{commands.join(" ")}</span>))

	useEvent(socket, JoinServerEvent, ({id}) => fetchCharacter(socket, id).then(character => addNode(`${character?.name} joined`)))

	useEvent(socket, LeaveServerEvent, ({id}) => fetchCharacter(socket, id).then(character => addNode(`${character?.name} left`)))

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