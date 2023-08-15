"use client"

import { useCharacter } from "@/lib/client/character"
import { usePlayerRoom } from "@/lib/client/room"
import styles from "./character-list.module.css"
import pageStyles from "./page.module.css"

export default function CharacterList()
{
	const room = usePlayerRoom()
	
	return (
		<div className={`${pageStyles.bordered} ${styles.characters}`}>
			{ room ?
				<ul>
					{room.characterIds.map(characterId => <CharacterItem key={characterId} id={characterId}/>)}
				</ul>
				:
				"Nobody came."
			}
		</div>
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