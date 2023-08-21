import { CommandEvent, CreateEvent, DisconnectEvent, EchoEvent, ErrorEvent, HelpEvent, JoinEvent, LeaveEvent, LocationRoom, SayEvent, Server, ServerSocket, SwitchEvent } from "../../websocket-events"
import { GameObject } from "@prisma/client"
import { getSocketUserId } from "./context"

export const playingPlayerIds: number[] = []

const notPlayingError = "Not playing - use switch command"

export default function registerCommands(io: Server, socket: ServerSocket)
{
	let player: GameObject | null = null

	const commands: Record<string, (args: string) => void | string | Promise<void | string>> = {
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
			if (!player) return notPlayingError

			io.in(LocationRoom(player.locationId)).emit(SayEvent, {speakerId: player.id, text})
		},

		switch: async (text: string) =>
		{
			const id = parseInt(text)
			if (isNaN(id)) return `ID "${text}" is not a number`
			if (id in playingPlayerIds) `Object ${id} is already being played`

			const newPlayer = await prisma.gameObject.findUnique({where: {id}})
			if (!newPlayer) return `No object with ID ${id}`

			const user = await getSocketUserId(socket)
			if (newPlayer.userId != user) return `You do not own object ${id}`

			if (player) leave()
			player = newPlayer
			socket.emit(SwitchEvent, {id})
			join()
		},

		create: async () =>
		{
			const user = await getSocketUserId(socket)
			const newObject = await prisma.gameObject.create({data: {
				userId: user,
				locationId: 1,
			}})
			socket.emit(CreateEvent, {id: newObject.id})
		}
	}

	socket.onPermanentAsync(CommandEvent, async ({command}) =>
	{
		const [commandName, args] = command.split(" ", 2)
		if (commandName in commands)
		{
			const error = await commands[commandName](args)
			if (error) socket.emit(ErrorEvent, {error})
		}
		else
			socket.emit(ErrorEvent, {error: `Unknown command "${command}"`})
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