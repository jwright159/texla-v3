import { CommandEvent, CreateEvent, DeleteEvent, DisconnectEvent, EchoEvent, HelpEvent, IdNaNError, JoinEvent, LeaveEvent, LocationRoom, NotPlayingError, ObjectBeingPlayedError, ObjectNotEmptyError, ObjectNotFoundError, PermissionError, SayEvent, Server, ServerSocket, ServerWebSocketEvent, SwitchEvent, UnknownCommandError } from "../../websocket-events"
import { GameObject } from "@prisma/client"
import { getSocketUserId } from "./context"
import { Updater } from "."

export const playingPlayerIds: number[] = []

export default function registerCommands(io: Server, socket: ServerSocket, updater: Updater)
{
	let player: GameObject | null = null

	const check = {
		sendError: <TEvent extends ServerWebSocketEvent<TArgs, void>, TArgs>(event: TEvent, args: TArgs) =>
		{
			socket.emit(event, args)
			return true
		},

		isIdNaN: (id: number, idText: string) => isNaN(id) && check.sendError(IdNaNError, {id: idText}),
		
		isObjectBeingPlayed: (id: number) => playingPlayerIds.includes(id) && check.sendError(ObjectBeingPlayedError, {id}),

		isObjectNotFound: (id: number, obj: GameObject | null): obj is null => !obj && check.sendError(ObjectNotFoundError, {id}),

		objectContainsOtherObjects: (obj: GameObject & {contents: GameObject[]}) => obj.contents.length && !(obj.contents.length == 1 && obj.contents[0].id == obj.id) && check.sendError(ObjectNotEmptyError, {id: obj.id}),

		userDoesntOwnObject: (userId: number, obj: GameObject) => obj.userId != userId && check.sendError(PermissionError, {id: obj.id})
	} as const

	const commands: Record<string, (args: string) => void | Promise<void>> = {
		echo: (text: string) =>
		{
			socket.emit(EchoEvent, {text})
		},

		help: () =>
		{
			socket.emit(HelpEvent, {commands: Object.keys(commands)})
		},

		say: async (text: string) =>
		{
			if (!player) return socket.emit(NotPlayingError)

			io.in(LocationRoom(player.locationId)).emit(SayEvent, {speakerId: player.id, text})
		},

		create: async () =>
		{
			const voidroom = await prisma.gameObject.findUnique({where: {id: 1}})

			const user = await getSocketUserId(socket)
			const newObject = await prisma.gameObject.create({data: {
				id: voidroom ? undefined : 1,
				userId: user,
				locationId: 1,
			}})
			socket.emit(CreateEvent, {id: newObject.id})
		},

		delete: async (text: string) =>
		{
			const id = parseInt(text)
			if (check.isIdNaN(id, text)) return
			if (check.isObjectBeingPlayed(id)) return

			const existingObject = await prisma.gameObject.findUnique({where: {id}, include: {contents: true}})
			if (check.isObjectNotFound(id, existingObject)) return

			if (check.objectContainsOtherObjects(existingObject)) return

			const userId = await getSocketUserId(socket)
			if (check.userDoesntOwnObject(userId, existingObject)) return

			await prisma.gameObject.delete({where: {id}})
			socket.emit(DeleteEvent, {id})
			updater.emitGameObjectUpdate(existingObject.locationId)
		},

		switch: async (text: string) =>
		{
			if (text == "out") switchOut()
			else await switchIn()
			
			function switchOut()
			{
				if (player) leave()
				player = null
				socket.emit(SwitchEvent, {id: 0})
			}

			async function switchIn()
			{
				const id = parseInt(text)
				if (check.isIdNaN(id, text)) return
				if (check.isObjectBeingPlayed(id)) return

				const newPlayer = await prisma.gameObject.findUnique({where: {id}})
				if (check.isObjectNotFound(id, newPlayer)) return

				const userId = await getSocketUserId(socket)
				if (check.userDoesntOwnObject(userId, newPlayer)) return

				if (player) leave()
				player = newPlayer
				socket.emit(SwitchEvent, {id})
				join()
			}
		},
	}

	socket.onPermanentAsync(CommandEvent, async ({command}) =>
	{
		const [commandName, args] = command.split(" ", 2)
		if (commandName in commands)
			await commands[commandName](args)
		else
			socket.emit(UnknownCommandError, {command: commandName})
	})

	let joined = false
	function join()
	{
		if (joined || !player) return
		playingPlayerIds.push(player.id)
		const room = LocationRoom(player.locationId)
		socket.join(room)
		io.in(room).emit(JoinEvent, {id: player.id})
		joined = true
	}
	function leave()
	{
		if (!joined || !player) return
		playingPlayerIds.splice(playingPlayerIds.indexOf(player.id), 1)
		const room = LocationRoom(player.locationId)
		io.in(room).emit(LeaveEvent, {id: player.id})
		socket.leave(room)
		joined = false
	}

	socket.onPermanent(DisconnectEvent, leave)
}