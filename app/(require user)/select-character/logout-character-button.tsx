"use client"

import { useLogoutCharacter } from "@/lib/client/character-id"

export default function LogoutButton()
{
	const {isPending, logout} = useLogoutCharacter()
	return <button onClick={logout} disabled={isPending}>Logout Character</button>
}