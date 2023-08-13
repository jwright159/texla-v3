"use client"

import LogoutButton from "../../../login/logout-button"
import LogoutCharacterButton from "../../select-character/logout-character-button"
import { useCharacter, usePlayerCharacter } from "@/lib/client/character"
import { usePlayerRoom } from "@/lib/client/room"
import { ReactElement, useEffect, useRef, useState } from "react"
import styles from "./page.module.css"

export default function Index()
{
	const character = usePlayerCharacter()!
	const room = usePlayerRoom()

	const [nodes, setNodes] = useState<ReactElement[]>([
		<div key={0}>Welcome, {character.name}</div>,
		<CharacterList key={1}/>
	])
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
				<div className={styles.gameBox}>
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
						className={styles.input}
						placeholder="Input command..."
					></input>
					<button
						className={styles.submitButton}
						onClick={addTextToBox}
					>→</button>
				</div>
			</div>

			<div>
				<LogoutButton/>
				<LogoutCharacterButton/>
			</div>
		</main>
	)
}

function CharacterList()
{
	const character = usePlayerCharacter()!
	const room = usePlayerRoom()
	const otherCharacters = room?.characterIds.filter(characterId => characterId !== character.id)

	return (otherCharacters?.length ?
		<div>
			Also in room:
			<ul>
				{otherCharacters.map(characterId => <CharacterItem key={characterId} id={characterId}/>)}
			</ul>
		</div>
	:
		<div>No one else is here</div>
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