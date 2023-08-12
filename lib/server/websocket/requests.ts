import { DeleteCharacterRequest, RegisterCharacterRequest, RegisterUserRequest, VerifyUserRequest, on, onAsync } from "../../websocket-requests"
import { Server, Socket } from "socket.io"
import { parseUserId, registerUser, verifyUser } from "../user"
import { deleteCharacter, registerCharacter } from "../character"
import { unsealSocketCookie } from "../cookies"

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

export function registerRequests(io: Server, socket: Socket)
{
	onAsync(socket, VerifyUserRequest, stringAsErrorAsync(({username, password}) => verifyUser(username, password)))
	onAsync(socket, RegisterUserRequest, stringAsErrorAsync(({username, password}) => registerUser(username, password)))
	onAsync(socket, RegisterCharacterRequest, stringAsErrorAsync(async ({name}) => await registerCharacter(await parseUserId(await unsealSocketCookie(socket)), name)))
	onAsync(socket, DeleteCharacterRequest, stringAsErrorAsync(async ({id}) => await deleteCharacter(await parseUserId(await unsealSocketCookie(socket)), id)))
}