import prisma from "../prisma"
import { createSubscriptionFromModel } from "./model-subscriptions"
import { registerRequests } from "./requests"
import registerUserAuth from "./user"
import registerCommands from "./commands"
import { GameObject, Prop, User } from "@prisma/client"
import { GameObject as ClientGameObject, User as ClientUser } from "../../context"
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

export interface Updater
{
	emitUserUpdate: (id: number) => void;
	emitGameObjectUpdate: (id: number) => void;
}

function setupWebSocket(io: Server, socket: ServerSocket)
{
	const [emitUserUpdate] = createSubscriptionFromModel<User, ClientUser, {gameObjects: GameObject[]}>()(io, socket, prisma.user, "user", {gameObjects: true}, user => ({
		id: user.id,
		username: user.username,
		objectIds: user.gameObjects.map((gameObject: GameObject) => gameObject.id),
	}))
	const [emitGameObjectUpdate] = createSubscriptionFromModel<GameObject, ClientGameObject, {contents: GameObject[], props: Prop[]}>()(io, socket, prisma.gameObject, "gameObject", {contents: true, props: true}, gameObject => ({
		id: gameObject.id,
		userId: gameObject.userId,
		locationId: gameObject.locationId,
		contentsIds: gameObject.contents.map((contents: GameObject) => contents.id),
		props: Object.fromEntries(gameObject.props.map(prop => [prop.name, prop.value])),
	}))

	const updater: Updater = {
		emitUserUpdate,
		emitGameObjectUpdate,
	}

	registerRequests(io, socket)
	registerUserAuth(io, socket)
	registerCommands(io, socket, updater)
}
