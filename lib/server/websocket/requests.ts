import { RegisterUserEvent, Server, ServerSocket, VerifyUserEvent } from "../../websocket-events"
import { registerUser, verifyUser } from "../user"

function stringAsError<TArgs, TResponse>(func: (args: TArgs) => Promise<TResponse | string>)
{
	return async (args: TArgs) =>
	{
		const res = await func(args)
		if (typeof res === "string")
			return { error: res }
		else
			return { body: res }
	}
}

export function registerRequests(io: Server, socket: ServerSocket)
{
	socket.onPermanentAsync(VerifyUserEvent, stringAsError(({username, password}) => verifyUser(username, password)))
	socket.onPermanentAsync(RegisterUserEvent, stringAsError(({username, password}) => registerUser(username, password)))
}