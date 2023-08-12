import { Namespace } from "socket.io"
import { unsealSocketCookie } from "../cookies"
import { parseUserId } from "../user"

export default function registerUserNamespace(io: Namespace)
{
	registerAuth(io)
}

function registerAuth(io: Namespace)
{
	io.use((socket, next) => void (async () =>
	{
		const cookie = await unsealSocketCookie(socket)
		const userId = await parseUserId(cookie)
		
		if (userId)
			next()
		else
			next(new Error("Invalid auth"))
	})())
}