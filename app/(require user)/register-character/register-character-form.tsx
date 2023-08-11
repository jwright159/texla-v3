"use client"

import { useLoginCharacter } from "@/lib/context/character-id"
import Link from "next/link"

export default function RegisterCharacterForm()
{
	const {isPending, errorText, register} = useLoginCharacter()

	return (
		<form onSubmit={event =>
		{
			event.preventDefault()
			const sessionName = `${event.currentTarget.sessionName.value}`
			const characterName = `${event.currentTarget.characterName.value}`
			register(sessionName, characterName)
		}}>
			<p><label htmlFor="sessionName">Existing session name:</label> <input id="sessionName" name="sessionName" disabled={isPending}/> or <Link href="/register-session">create a new session</Link></p>

			<p><label htmlFor="characterName">Name:</label> <input id="characterName" name="characterName" disabled={isPending}/></p>

			<input type="submit" value="Register" disabled={isPending}/>

			<p style={{ color: "red" }}>{errorText}</p>
		</form>
	)
}
