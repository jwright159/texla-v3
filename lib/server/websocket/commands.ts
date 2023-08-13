import { Server, Socket } from "socket.io"

const commands: Record<string, (io: Server, socket: Socket, args: string) => void> = {
	echo: (io: Server, socket: Socket, args: string) =>
	{
		socket.emit("echo", args)
	}
}

export default function registerCommands(io: Server, socket: Socket)
{
	socket.on("command", (command: string) =>
	{
		const [commandName, args] = command.split(" ", 2)
		if (commandName in commands)
			commands[commandName](io, socket, args)
		else
			socket.emit("unknown-command", `Unknown command: ${commandName}`)
	})
}