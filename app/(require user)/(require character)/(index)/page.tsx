"use client"

import LogoutButton from "../../../login/logout-button"
import LogoutCharacterButton from "../../select-character/logout-character-button"
import { useCharacter, usePlayerCharacter } from "@/lib/client/character"
import { usePlayerRoom } from "@/lib/client/room"
import { ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from "react"
import styles from "./page.module.css"
import { usePlayerUser } from "@/lib/client/user"
import { useWebSocket } from "@/lib/client/websocket"
import { Socket } from "socket.io-client"

export default function Index()
{
	const socket = useWebSocket()

	const user = usePlayerUser()!
	const character = usePlayerCharacter()!
	const room = usePlayerRoom()

	const [nodes, setNodes] = useState<ReactElement[]>([])
	const [nodeCount, setNodeCount] = useState(nodes.length)

	const [input, setInput] = useState("")

	const scrollTo = useRef<HTMLDivElement>(null)
	useEffect(() => scrollTo.current!.scrollIntoView(), [nodes])

	function addNode(node: ReactNode)
	{
		setNodes(nodes => [...nodes, <div key={nodeCount}>{node}</div>])
		setNodeCount(count => count + 1)
	}

	function sendCommand()
	{
		if (!input) return
		addNode(<span className={styles.command}>&gt;{input}</span>)
		socket.emit("command", input)
		setInput("")
	}

	const commands: Record<string, (args: string) => void> = {
		"unknown-command": (text: string) =>
		{
			addNode(text)
		},

		echo: (text: string) =>
		{
			addNode(text)
		},
	}

	function registerCommands(socket: Socket, commands: Record<string, (args: string) => void>)
	{
		Object.entries(commands).forEach(([name, command]) => socket.on(name, command))
	}

	function unregisterCommands(socket: Socket, commands: Record<string, (args: string) => void>)
	{
		Object.entries(commands).forEach(([name, command]) => socket.off(name, command))
	}

	useEffect(() =>
	{
		const localCommands = commands // just in case "commands" ends up being something different by the time it unregisters
		registerCommands(socket, localCommands)
		return () => unregisterCommands(socket, localCommands)
	}, [socket])

	return (
		<main className={styles.main}>
			<h1 className={styles.header}>You are in <span style={{fontFamily: "monospace"}}>{room?.name ?? "null"}</span></h1>

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