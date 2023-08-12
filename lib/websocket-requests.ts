import { Socket as ServerSocket } from "socket.io"
import { Socket as ClientSocket } from "socket.io-client"

export interface WebSocketRequest<TArgs, TResponse> {
	event: string;
}

export const VerifyUserRequest: WebSocketRequest<{username: string, password: string}, number> = {
	event: "verify-user",
}

export const RegisterUserRequest: WebSocketRequest<{username: string, password: string}, number> = {
	event: "register-user",
}

export const RegisterCharacterRequest: WebSocketRequest<{name: string}, number> = {
	event: "register-character",
}

export const DeleteCharacterRequest: WebSocketRequest<{id: number}, number> = {
	event: "delete-character",
}

export interface Response<TResponse> {
	error?: string;
	body?: TResponse;
}

export function emit<TArgs, TResponse>(
	socket: ClientSocket,
	request: WebSocketRequest<TArgs, TResponse>,
	args: TArgs,
	callback?: (response: Response<TResponse>) => void,
)
{
	socket.emit(request.event, args, callback)
}

export function on<TArgs, TResponse>(
	socket: ServerSocket,
	request: WebSocketRequest<TArgs, TResponse>,
	listener: (args: TArgs) => Response<TResponse>,
)
{
	socket.on(request.event, (args: TArgs, callback?: (res: Response<TResponse>) => void) =>
	{
		if (callback)
			callback(listener(args))
		else
			listener(args)
	})
}

export function onAsync<TArgs, TResponse>(
	socket: ServerSocket,
	request: WebSocketRequest<TArgs, TResponse>,
	listener: (args: TArgs) => Promise<Response<TResponse>>,
)
{
	socket.on(request.event, async (args: TArgs, callback?: (res: Response<TResponse>) => void) =>
	{
		if (callback)
			callback(await listener(args))
		else
			await listener(args)
	})
}