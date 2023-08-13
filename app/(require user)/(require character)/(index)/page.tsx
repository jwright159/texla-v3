"use client"

import LogoutButton from "../../../login/logout-button"
import LogoutCharacterButton from "../../select-character/logout-character-button"
import { useCharacter, usePlayerCharacter } from "@/lib/client/character"
import { usePlayerRoom } from "@/lib/client/room"
import { ReactElement, useEffect, useRef, useState } from "react"
import styles from "./page.module.css"
import { usePlayerUser } from "@/lib/client/user"

export default function Index()
{
	const user = usePlayerUser()!
	const character = usePlayerCharacter()!
	const room = usePlayerRoom()

	const [nodes, setNodes] = useState<ReactElement[]>([])
	const [nodeCount, setNodeCount] = useState(nodes.length)

	const [input, setInput] = useState("")

	const scrollTo = useRef<HTMLDivElement>(null)
	useEffect(() => scrollTo.current!.scrollIntoView(), [nodes])

	function addTextToBox()
	{
		if (!input) return
		setNodes(nodes => [...nodes, <div className={styles.command} key={nodeCount}>&gt;{input}</div>])
		setNodeCount(count => count + 1)
		setInput("")
	}

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
									addTextToBox()
								}
							}}
							className={[styles.input, styles.bordered].join(" ")}
							placeholder="Input command..."
						></input>
						<button
							className={styles.submitButton}
							onClick={addTextToBox}
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