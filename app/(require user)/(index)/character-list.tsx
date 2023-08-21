"use client"

import { useGameObject, usePlayerLocation } from "@/lib/client/game-object"
import styles from "./character-list.module.css"
import pageStyles from "./page.module.css"

export default function CharacterList()
{
	const location = usePlayerLocation()
	
	return (
		<div className={`${pageStyles.bordered} ${styles.characters}`}>
			{ location ?
				<ul>
					{location.contentsIds.map(contentsId => <CharacterItem key={contentsId} id={contentsId}/>)}
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
	const character = useGameObject(id)
	return (character?.props["playable"] &&
		<li>{character.props["name"]}</li>
	)
}