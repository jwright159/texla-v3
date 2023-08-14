import { DeleteCharacterEvent, RegisterCharacterEvent, RegisterUserEvent, Server, ServerSocket, VerifyUserEvent } from "../../websocket-events"
import { registerUser, verifyUser } from "../user"
import { deleteCharacter, registerCharacter } from "../character"
import { getSocketUserId } from "./context"

function stringAsError<TArgs, TResponse>(func: (args: TArgs) => TResponse | string)
{
	return (args: TArgs) =>
	{
		const res = func(args)
		if (typeof res === "string")
			return { error: res }
		else
			return { body: res }
	}
}

function stringAsErrorAsync<TArgs, TResponse>(func: (args: TArgs) => Promise<TResponse | string>)
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
	socket.onPermanentAsync(VerifyUserEvent, stringAsErrorAsync(({username, password}) => verifyUser(username, password)))
	socket.onPermanentAsync(RegisterUserEvent, stringAsErrorAsync(({username, password}) => registerUser(username, password)))
	socket.onPermanentAsync(RegisterCharacterEvent, stringAsErrorAsync(async ({name}) => await registerCharacter(await getSocketUserId(socket), name)))
	socket.onPermanentAsync(DeleteCharacterEvent, stringAsErrorAsync(async ({id}) => await deleteCharacter(await getSocketUserId(socket), id)))
}