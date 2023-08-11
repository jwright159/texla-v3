"use client"

import { User as UserModel } from "@prisma/client"
import { createCache } from "./context"
import { useUserId } from "./user-id"

export interface User extends UserModel {
	characterIds: number[],
}

export const [useUser, useSetCharacter] = createCache<User>("user")

export const usePlayerUser = () =>
{
	const userId = useUserId()
	const user = useUser(userId)
	return userId !== 0 ? user : undefined
}