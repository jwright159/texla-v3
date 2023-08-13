import { Server, Socket } from "socket.io"
import prisma from "../prisma"
import { createSubscriptionFromModelIncludingIds, createSubscriptionFromModel } from "./model-subscriptions"
import { registerRequests } from "./requests"
import registerUserNamespace from "./user"
import registerCommands from "./commands"

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
	createSubscriptionFromModelIncludingIds(io, socket, prisma, "user", {characters: "characterIds", rooms: "roomIds"})
	createSubscriptionFromModel(io, socket, prisma, "character")
	createSubscriptionFromModelIncludingIds(io, socket, prisma, "room", {characters: "characterIds"})

	registerRequests(io, socket)
	registerCommands(io, socket)
}
