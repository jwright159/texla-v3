import { Server, Socket } from "socket.io"
import { unsealSocketCookie } from "../cookies"
import { parseUserId } from "../user"

export default function registerUserNamespace(io: Server)
{
	io.on("connect", socket => registerAuth(io, socket))
}

function registerAuth(io: Server, socket: Socket)
{
	let attemptedAuth = false;
	let authenticated = false;
	socket.use(([event, args, callback], next) => void (async () =>
	{
		if (!attemptedAuth)
		{
			const cookie = await unsealSocketCookie(socket)
			const userId = await parseUserId(cookie)
			authenticated = !!userId
		}
		
		if (authenticated || (
			event === "verify-user" ||
			event === "register-user"
		))
			next()
		else
		{
			if (callback && typeof callback === "function")
				callback({error: "Invalid auth"})
			next(new Error("Invalid auth"))
		}
	})())
}