"use client"

import { usePlayerUser } from "@/lib/context/user"
import { useCharacter } from "@/lib/context/character"
import { useEntity } from "@/lib/context/entity"
import { useLoginCharacter } from "@/lib/context/character-id"

export default function LoginCharacterForm()
{
	const {isPending, errorText, login} = useLoginCharacter()
	const user = usePlayerUser()!

	return (user.characterIds.length ?
			<form onSubmit={event => {
				event.preventDefault()
				const characterId = parseInt(event.currentTarget.characterId.value)
				login(characterId)
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
	const entity = useEntity(character?.entityId ?? 0)

	return (character && entity ?
			<p><input id={id.toString()} name="characterId" type="radio" value={character.id} disabled={disabled}/> <label htmlFor={character.id.toString()}>{entity.name}</label></p>
		:
			<p>Loading character...</p>
	)
}