"use client"

import { User } from "../context"
import { createCache } from "./context"
import { useUserId } from "./user-id"

export const useUser = createCache<User>("user")

export const usePlayerUser = () =>
{
	const userId = useUserId()
	const user = useUser(userId)
	return userId !== 0 ? user : undefined
}