import { unsealSocketCookie } from "../cookies"
import { parseUserId } from "../user"
import prisma from "../prisma"
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
