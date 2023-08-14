import { Server, ServerSocket } from "@/lib/websocket-events"
import { getSocketUser } from "./context"

export default function registerUserAuth(io: Server, socket: ServerSocket)
{
	let attemptedAuth = false;
	let authenticated = false;
	socket.use(async ([event], next) =>
	{
		if (!attemptedAuth)
		{
			attemptedAuth = true
			authenticated = !!await getSocketUser(socket)
		}
		
		if (authenticated || (
			event === "verify-user" ||
			event === "register-user"
		))
			next()
		else
			next(new Error("Invalid auth"))
	})
}