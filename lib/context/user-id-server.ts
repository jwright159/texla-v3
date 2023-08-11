"use server"

import { User } from "@prisma/client"
import { unsealCookie, sealCookie } from "../cookies-server"
import prisma from "../prisma"

export async function getUserId(): Promise<number>
{
	return parseUserId(await unsealCookie())
}

export async function parseUserId(cookieData: any): Promise<number>
{
	if (!cookieData) return 0

	const { userId, password } = cookieData

	if (!userId || typeof userId !== "number") return 0
	if (!password || typeof password !== "string") return 0

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
			password
		}
	})
	if (!user) return 0

	return userId
}

export async function setUser(user: User)
{
	await sealCookie({
		userId: user.id,
		password: user.password,
	})
}

export async function unsetUser()
{
	await sealCookie({
		userId: undefined,
		password: undefined,
	})
}