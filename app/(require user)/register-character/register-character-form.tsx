"use client"

import { useRegisterCharacter } from "@/lib/client/character-id"

export default function RegisterCharacterForm()
{
	const {isPending, errorText, register} = useRegisterCharacter()

	return (
		<form onSubmit={event =>
		{
			event.preventDefault()
			const characterName = `${event.currentTarget.characterName.value}`
			register(characterName)
		}}>
			<p><label htmlFor="characterName">Name:</label> <input id="characterName" name="characterName" disabled={isPending}/></p>

			<input type="submit" value="Register" disabled={isPending}/>

			<p style={{ color: "red" }}>{errorText}</p>
		</form>
	)
}
