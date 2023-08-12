"use client"

import { MainPanel } from "@/components/panel"
import LogoutButton from "../../../login/logout-button"
import LogoutCharacterButton from "../../select-character/logout-character-button"
import { usePlayerCharacter } from "@/lib/client/character"

export default function Index()
{
	const character = usePlayerCharacter()!

	return (
		<MainPanel title="Hello, world!">
			<p>Welcome, {character.name}</p>
			<LogoutButton/>
			<LogoutCharacterButton/>
		</MainPanel>
	)
}
