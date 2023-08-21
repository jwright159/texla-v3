"use client"

import { usePlayerUser } from "@/lib/client/user"
import LogoutButton from "../../login/logout-button"
import { usePlayer } from "@/lib/client/game-object"

export default function LoginInfo()
{
	const user = usePlayerUser()!
	const player = usePlayer()

	return (
		<div>
			Logged in as {user.username}{player && <>, playing as {player.props["name"] ?? "unnamed object"} </>} &nbsp; <LogoutButton/> &nbsp;
		</div>
	)
}