import prisma from "../prisma"
import { createSubscriptionFromModelIncludingIds, createSubscriptionFromModel } from "./model-subscriptions"
import { registerRequests } from "./requests"
import registerUserAuth from "./user"
import registerCommands from "./commands"
import { Character, Room, User } from "@prisma/client"
import { Character as ClientCharacter, Room as ClientRoom, User as ClientUser } from "../../context"
import { DisconnectEvent, Server, ServerSocket } from "../../websocket-events"

export default function setupWebSocketServer(io: Server)
{
	io.onConnect(socket =>
	{
		console.log(`Connected ${socket.id}`)
		socket.onPermanent(DisconnectEvent, reason => console.log(`Disconnected ${socket.id} ${reason}`))

		setupWebSocket(io, socket)
	})

}

function setupWebSocket(io: Server, socket: ServerSocket)
{
	createSubscriptionFromModelIncludingIds<User, ClientUser>()(io, socket, prisma, "user", {characters: "characterIds", rooms: "roomIds"}, user => ({
		id: user.id,
		username: user.username,
		characterIds: user.characterIds,
		roomIds: user.roomIds,
	}))
	createSubscriptionFromModel<Character, ClientCharacter>()(io, socket, prisma, "character", character => ({
		id: character.id,
		name: character.name,
		roomId: character.roomId,
		userId: character.userId,
	}))
	createSubscriptionFromModelIncludingIds<Room, ClientRoom>()(io, socket, prisma, "room", {characters: "characterIds"}, room => ({
		id: room.id,
		userId: room.id,
		name: room.name,
		characterIds: room.characterIds,
	}))

	registerRequests(io, socket)
	registerUserAuth(io, socket)
	registerCommands(io, socket)
}
