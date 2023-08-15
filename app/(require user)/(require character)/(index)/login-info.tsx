"use client"

import { usePlayerCharacter } from "@/lib/client/character"
import { usePlayerUser } from "@/lib/client/user"
import LogoutButton from "../../../login/logout-button"
import LogoutCharacterButton from "../../select-character/logout-character-button"

export default function LoginInfo()
{
	const user = usePlayerUser()!
	const character = usePlayerCharacter()!

	return (
		<div>
			Logged in as {user.username} &nbsp; <LogoutButton/> &nbsp;
			Playing as {character.name} &nbsp; <LogoutCharacterButton/> &nbsp;
		</div>
	)
}