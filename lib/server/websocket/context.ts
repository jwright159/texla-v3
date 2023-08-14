import { unsealSocketCookie } from "../cookies"
import { parseUserId } from "../user"
import prisma from "../prisma"
import { parseCharacterId } from "../character"
import { ServerSocket } from "@/lib/websocket-events"

export async function getSocketUserId(socket: ServerSocket)
{
	const cookie = await unsealSocketCookie(socket)
	const userId = parseUserId(cookie)
	return userId
}

export async function getSocketUser(socket: ServerSocket)
{
	const userId = await getSocketUserId(socket)
	return userId ? await prisma.user.findUnique({where: {id: userId}}) : undefined
}

export async function getSocketCharacterId(socket: ServerSocket)
{
	const cookie = await unsealSocketCookie(socket)
	const userId = await parseUserId(cookie)
	const characterId = await parseCharacterId(userId, cookie)
	return characterId
}

export async function getSocketCharacter(socket: ServerSocket)
{
	const characterId = await getSocketCharacterId(socket)
	return characterId ? await prisma.character.findUnique({where: {id: characterId}}) : undefined
}