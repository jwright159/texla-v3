import { DeleteCharacterEvent, RegisterCharacterEvent, RegisterUserEvent, Server, ServerSocket, VerifyUserEvent } from "../../websocket-events"
import { registerUser, verifyUser } from "../user"
import { deleteCharacter, registerCharacter } from "../character"
import { getSocketUserId } from "./context"

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
	socket.onPermanentAsync(RegisterCharacterEvent, stringAsError(async ({name}) => await registerCharacter(await getSocketUserId(socket), name)))
	socket.onPermanentAsync(DeleteCharacterEvent, stringAsError(async ({id}) => await deleteCharacter(await getSocketUserId(socket), id)))
}