import { Server, Socket } from "socket.io"
import prisma from "../prisma"
import { createSubscriptionFromModelIncludingIds, createSubscriptionFromModel } from "./model-subscriptions"
import { parse as parseCookie } from "cookie"
import { parseUserId } from "../context/user-id-server"
import { unsealCookieAgnostic } from "../cookies-server"

let messageId = 0

export default function setupWebSocket(io: Server, socket: Socket)
{
	console.log(`Connected ${socket.id}`)
	socket.on("disconnect", () => console.log(`Disconnected ${socket.id}`))

	registerAuthMessages(io, socket)

	createSubscriptionFromModelIncludingIds(io, socket, prisma, "user", {characters: "characterIds"})
	createSubscriptionFromModel(io, socket, prisma, "character")

	registerPesterchumMessages(io, socket)
}

function registerAuthMessages(io: Server, socket: Socket)
{
	// The only cookies available are from the initial connection. Reauthenticating requires reconnecting.

	const cookieName = process.env.SESSION_COOKIE as string
	
	let attemptedAuth = false
	let authenticated = false
	socket.use(([event], next) => void (async () =>
	{
		if (!attemptedAuth)
		{
			const cookie = parseCookie(socket.handshake.headers.cookie ?? "")[cookieName]
			const cookieData = await unsealCookieAgnostic(cookie)
			const userId = await parseUserId(cookieData)
			authenticated = !!userId
		}
		
		if (authenticated)
			next()
		else
			next(new Error("Invalid auth"))
	})())
}

function registerPesterchumMessages(io: Server, socket: Socket)
{
	let username = ""
	let isInChat = false
	socket.on("send-message", message => io.in("chat").emit("send-message", {...message, id: messageId++}))
	socket.on("join-chat", user =>
	{
		if (isInChat) return
		username = user
		isInChat = true
		socket.join("chat")
		io.in("chat").emit("join-chat", {sender: username, id: messageId++})
	})
	socket.on("leave-chat", () =>
	{
		if (!isInChat) return
		isInChat = false
		io.in("chat").emit("leave-chat", {sender: username, id: messageId++})
		socket.leave("chat")
	})
	socket.on("disconnect", () =>
	{
		if (isInChat) io.in("chat").emit("leave-chat", {sender: username, id: messageId++})
	})
}
