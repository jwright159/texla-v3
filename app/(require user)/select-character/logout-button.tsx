"use client"

import { useLogoutUser } from "@/lib/context/user-id"

export default function LogoutButton()
{
	const {isPending, logout} = useLogoutUser()
	return <button onClick={logout} disabled={isPending}>Logout</button>
}