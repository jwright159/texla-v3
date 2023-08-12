import { Server, Socket } from "socket.io"
import prisma from "../prisma"
import { createSubscriptionFromModelIncludingIds, createSubscriptionFromModel } from "./model-subscriptions"
import { registerRequests } from "./requests"
import registerUserNamespace from "./user"

let messageId = 0

export default function setupWebSocketServer(io: Server)
{
	io.on("connect", socket =>
	{
		console.log(`Connected ${socket.id}`)
		socket.on("disconnect", () => console.log(`Disconnected ${socket.id}`))

		setupWebSocket(io, socket)
	})

	registerUserNamespace(io)
}

function setupWebSocket(io: Server, socket: Socket)
{
	createSubscriptionFromModelIncludingIds(io, socket, prisma, "user", {characters: "characterIds"})
	createSubscriptionFromModel(io, socket, prisma, "character")

	registerRequests(io, socket)

	registerPesterchumMessages(io, socket)
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
