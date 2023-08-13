"use client"

import LogoutButton from "../../../login/logout-button"
import LogoutCharacterButton from "../../select-character/logout-character-button"
import { useCharacter, usePlayerCharacter } from "@/lib/client/character"
import { usePlayerRoom } from "@/lib/client/room"
import { ReactElement, useState } from "react"
import styles from "./page.module.css"
import { useCharacterId } from "@/lib/client/character-id"

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

	return (
		<main>
			<h1>You are in <span style={{fontFamily: "monospace"}}>{room?.name ?? "null"}</span></h1>
			<div className={styles.game}>
				<ul className={styles.gameBox}>
					{nodes.map(node => <li key={node.key}>{node}</li>)}
				</ul>
				<div className={styles.inputWrapper}>
					<input
						value={input}
						onChange={event => setInput(event.target.value)}
						className={styles.input}
						placeholder="Input command..."
					></input>
					<button className={styles.submitButton}>→</button>
				</div>
			</div>
			<LogoutButton/>
			<LogoutCharacterButton/>
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
		<li>{character?.name}</li>
	)
}