import { getSocketCharacter } from "./context"
import { loggedInCharacterIds } from "../character"
import { CommandEvent, DisconnectEvent, EchoEvent, HelpEvent, JoinClientEvent, JoinServerEvent, LeaveClientEvent, LeaveServerEvent, RoomRoom, SayEvent, Server, ServerSocket, UnknownCommandEvent } from "../../websocket-events"
import { Updater } from "."
import { GameObject } from "@prisma/client"

export default function registerCommands(io: Server, socket: ServerSocket)
{
	let character: GameObject | null = null

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
			const character = (await getSocketCharacter(socket))!
			io.in(RoomRoom(character.roomId)).emit(SayEvent, {speakerId: character.id, text})
		},
	}

	socket.use(([event], next) => void (async () =>
	{	
		if (!character && (
			event === CommandEvent.event ||
			event === JoinClientEvent.event ||
			event === LeaveClientEvent.event
		))
			next(new Error("No player selected"))
		else if (!joined && (
			event === CommandEvent.event ||
			event === LeaveClientEvent.event
		))
			next(new Error("Not joined"))
		else
			next()
	})())

	socket.onPermanent(CommandEvent, ({command}) =>
	{
		const [commandName, args] = command.split(" ", 2)
		if (commandName in commands)
			commands[commandName](args)
		else
			socket.emit(UnknownCommandEvent, {command: commandName})
	})

	let joined = false
	async function join()
	{
		if (joined) return
		const character = (await getSocketCharacter(socket))!
		const room = RoomRoom(character.roomId)
		socket.join(room)
		io.in(room).emit(JoinServerEvent, {id: character.id})
		joined = true
	}
	async function leave()
	{
		if (!joined) return
		const character = (await getSocketCharacter(socket))!
		const room = RoomRoom(character.roomId)
		io.in(room).emit(LeaveServerEvent, {id: character.id})
		socket.leave(room)
		joined = false
	}

	socket.onPermanentAsync(JoinClientEvent, join)
	socket.onPermanentAsync(LeaveClientEvent, leave)
	socket.onPermanentAsync(DisconnectEvent, leave)
}