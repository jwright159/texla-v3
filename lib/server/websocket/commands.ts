import { getSocketCharacter } from "./context"
import { loggedInCharacterIds } from "../character"
import { CommandEvent, DisconnectEvent, EchoEvent, HelpEvent, JoinClientEvent, JoinServerEvent, LeaveClientEvent, LeaveServerEvent, RoomRoom, SayEvent, Server, ServerSocket, UnknownCommandEvent } from "../../websocket-events"
import { Updater } from "."

export default function registerCommands(io: Server, socket: ServerSocket)
{
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

	let attemptedAuth = false;
	let authenticated = false;
	socket.use(([event], next) => void (async () =>
	{
		if (!attemptedAuth)
		{
			attemptedAuth = true
			const character = await getSocketCharacter(socket)
			authenticated = !!character

			if (character)
			{
				if (character.id in loggedInCharacterIds)
				{
					authenticated = false
				}
				else
				{
					{
						loggedInCharacterIds.push(character.id)
						{(<Updater><any>socket).emitRoomUpdate(character.roomId)}
					}
					socket.onPermanent(DisconnectEvent, () =>
					{
						{(<Updater><any>socket).emitRoomUpdate(character.roomId)}
						loggedInCharacterIds.splice(loggedInCharacterIds.indexOf(character.id), 1)
					})
				}
			}
		}
		
		if (!authenticated && (
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

	let joined = false;
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