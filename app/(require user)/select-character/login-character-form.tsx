"use client"

import { usePlayerUser } from "@/lib/client/user"
import { useCharacter } from "@/lib/client/character"
import { useSelectCharacter } from "@/lib/client/character-id"

export default function LoginCharacterForm()
{
	const {isPending, errorText, selectCharacter} = useSelectCharacter()
	const user = usePlayerUser()!

	return (user.characterIds.length ?
		<form onSubmit={event => {
			event.preventDefault()
			const characterId = parseInt(event.currentTarget.characterId.value)
			selectCharacter(characterId)
		}}>
			{user.characterIds.map(id => <CharacterEntry key={id} id={id} disabled={isPending}/>)}

			<input type="submit" value="Select" disabled={isPending}/>

			<p style={{ color: "red" }}>{errorText}</p>
		</form>
		:
		<p>You have no characters!</p>
	)
}

function CharacterEntry({
	id,
	disabled,
}: {
	id: number,
	disabled: boolean,
})
{
	const character = useCharacter(id)

	return (character ?
		<p><input id={id.toString()} name="characterId" type="radio" value={character.id} disabled={disabled}/> <label htmlFor={character.id.toString()}>{character.name}</label></p>
		:
		<p>Loading character...</p>
	)
}