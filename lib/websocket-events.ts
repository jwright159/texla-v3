import { useEffect } from "react"
import { BroadcastOperator, Server as BaseServer, Socket as BaseServerSocket, Event } from "socket.io"
import { Socket as BaseClientSocket } from "socket.io-client"
import { DefaultEventsMap } from "socket.io/dist/typed-events"

export interface WebSocketEvent<TArgs, TResponse> {
	event: string;
	_args: TArgs,
	_response: TResponse,
	_listener: (args: TArgs) => TResponse,
}

export interface ClientWebSocketEvent<TArgs = void, TResponse = void> extends WebSocketEvent<TArgs, TResponse> {
	_client: true;
}

export interface ServerWebSocketEvent<TArgs = void, TResponse = void> extends WebSocketEvent<TArgs, TResponse> {
	_server: true;
}

export const VerifyUserEvent = <ClientWebSocketEvent<{username: string, password: string}, number>>{
	event: "verify-user",
}

export const RegisterUserEvent = <ClientWebSocketEvent<{username: string, password: string}, number>>{
	event: "register-user",
}

export const RegisterCharacterEvent = <ClientWebSocketEvent<{name: string}, number>>{
	event: "register-character",
}

export const DeleteCharacterEvent = <ClientWebSocketEvent<{id: number}, number>>{
	event: "delete-character",
}

export const SubscribeEvent = (table: string) => <ClientWebSocketEvent<{id: number}>>{
	event: `subscribe-${table}`,
}

export const UnsubscribeEvent = (table: string) => <ClientWebSocketEvent<{id: number}>>{
	event: `unsubscribe-${table}`,
}

export const FetchEvent = <T>(table: string) => <ClientWebSocketEvent<{id: number}, {value: T | null}>>{
	event: `fetch-${table}`,
}

export const UpdateEvent = <T>(table: string, id: number) => <ServerWebSocketEvent<{id: number, value: T | null}>>{
	event: `update-${table}-${id}`,
}

export const JoinServerEvent = <ServerWebSocketEvent<{id: number}>>{
	event: "join",
}

export const LeaveServerEvent = <ServerWebSocketEvent<{id: number}>>{
	event: "leave",
}

export const JoinClientEvent = <ClientWebSocketEvent>{
	event: "join",
}

export const LeaveClientEvent = <ClientWebSocketEvent>{
	event: "leave",
}

export const CommandEvent = <ClientWebSocketEvent<{command: string}>>{
	event: "command",
}

export const UnknownCommandEvent = <ServerWebSocketEvent<{command: string}>>{
	event: "unknown-command",
}

export const ConnectEvent = <ClientWebSocketEvent & ServerWebSocketEvent>{
	event: "connect",
}

export const DisconnectEvent = <ClientWebSocketEvent<string> & ServerWebSocketEvent<string>>{
	event: "disconnect",
}

export const SayEvent = <ServerWebSocketEvent<{speakerId: number, text: string}>>{
	event: "say",
}

export const HelpEvent = <ServerWebSocketEvent<{commands: string[]}>>{
	event: "help",
}

export const EchoEvent = <ServerWebSocketEvent<{text: string}>>{
	event: "echo",
}

export interface SocketRoom {
	room: string;
}

export const UpdateRoom = (table: string, id: number): SocketRoom => ({
	room: `update-${table}-${id}`,
})

export const RoomRoom = (id: number): SocketRoom => ({
	room: `room-${id}`,
})

export interface Response<TResponse> {
	error?: string;
	body?: TResponse;
}

export class ClientSocket
{
	socket: BaseClientSocket;

	constructor(socket: BaseClientSocket)
	{
		this.socket = socket
	}

	emit(
		event: ClientWebSocketEvent<void, void>,
	): void
	emit<TArgs>(
		event: ClientWebSocketEvent<TArgs, void>,
		args: TArgs,
	): void
	emit<TArgs, TResponse>(
		event: ClientWebSocketEvent<TArgs, TResponse>,
		args: TArgs,
		callback: (response: Response<TResponse>) => void,
	): void
	emit<TArgs, TResponse>(
		event: ClientWebSocketEvent<TArgs, TResponse>,
		args?: TArgs,
		callback?: (response: Response<TResponse>) => void,
	)
	{
		this.socket.emit(event.event, args, callback)
	}

	on<TArgs>(
		event: ServerWebSocketEvent<TArgs, void>,
		listener: (args: TArgs) => void,
	)
	{
		this.socket.on(event.event, listener)
	}

	off<TArgs>(
		event: ServerWebSocketEvent<TArgs, void>,
		listener: (args: TArgs) => void,
	)
	{
		this.socket.off(event.event, listener)
	}

	disconnect()
	{
		this.socket.disconnect()
	}

	get id()
	{
		return this.socket.id
	}
}

export function useEvent<TArgs>(
	socket: ClientSocket,
	event: ServerWebSocketEvent<TArgs, void>,
	listener: (args: TArgs) => void,
)
{
	useEffect(() =>
	{
		socket.on(event, listener)
		return () => socket.off(event, listener)
	}, [socket, event, listener])
}

export class ServerSocket
{
	socket: BaseServerSocket;

	constructor(socket: BaseServerSocket)
	{
		this.socket = socket
	}

	emit(
		event: ServerWebSocketEvent<void, void>,
	): void
	emit<TArgs>(
		event: ServerWebSocketEvent<TArgs, void>,
		args: TArgs,
	): void
	emit<TArgs, TResponse>(
		event: ServerWebSocketEvent<TArgs, TResponse>,
		args: TArgs,
		callback: (response: Response<TResponse>) => void,
	): void
	emit<TArgs, TResponse>(
		event: ServerWebSocketEvent<TArgs, TResponse>,
		args?: TArgs,
		callback?: (response: Response<TResponse>) => void,
	)
	{
		this.socket.emit(event.event, args, callback)
	}

	onPermanent<TArgs>(
		event: ClientWebSocketEvent<TArgs, void>,
		listener: (args: TArgs) => void,
	): void
	onPermanent<TArgs, TResponse>(
		event: ClientWebSocketEvent<TArgs, TResponse>,
		listener: (args: TArgs) => Response<TResponse>,
	): void
	onPermanent<TArgs, TResponse>(
		event: ClientWebSocketEvent<TArgs, TResponse>,
		listener: (args: TArgs) => Response<TResponse> | void,
	): void
	{
		this.socket.on(event.event, (args: TArgs, callback?: (res: Response<TResponse>) => void) =>
		{
			if (callback)
				callback(listener(args) ?? {})
			else
				listener(args)
		})
	}
	
	onPermanentAsync<TArgs>(
		event: ClientWebSocketEvent<TArgs, void>,
		listener: (args: TArgs) => Promise<void>,
	): void
	onPermanentAsync<TArgs, TResponse>(
		event: ClientWebSocketEvent<TArgs, TResponse>,
		listener: (args: TArgs) => Promise<Response<TResponse>>,
	): void
	onPermanentAsync<TArgs, TResponse>(
		event: ClientWebSocketEvent<TArgs, TResponse>,
		listener: (args: TArgs) => Promise<Response<TResponse> | void>,
	): void
	{
		this.socket.on(event.event, async (args: TArgs, callback?: (res: Response<TResponse>) => void) =>
		{
			if (callback)
				callback((await listener(args)) ?? {})
			else
				await listener(args)
		})
	}

	join(room: SocketRoom)
	{
		this.socket.join(room.room)
	}

	leave(room: SocketRoom)
	{
		this.socket.leave(room.room)
	}

	in(room: SocketRoom)
	{
		return new ServerRoomSocket(this.socket.in(room.room))
	}

	get id()
	{
		return this.socket.id
	}

	get cookie()
	{
		return this.socket.handshake.headers.cookie
	}

	use(middleware: (event: Event, next: (err?: Error | undefined) => void) => void)
	{
		this.socket.use(middleware)
	}
}

export class ServerRoomSocket
{
	socket: BroadcastOperator<DefaultEventsMap, any>;

	constructor(socket: BroadcastOperator<DefaultEventsMap, any>)
	{
		this.socket = socket;
	}

	emit(
		event: ServerWebSocketEvent<void, void>,
	): void
	emit<TArgs>(
		event: ServerWebSocketEvent<TArgs, void>,
		args: TArgs,
	): void
	emit<TArgs, TResponse>(
		event: ServerWebSocketEvent<TArgs, TResponse>,
		args: TArgs,
		callback: (response: Response<TResponse>) => void,
	): void
	emit<TArgs, TResponse>(
		event: ServerWebSocketEvent<TArgs, TResponse>,
		args?: TArgs,
		callback?: (response: Response<TResponse>) => void,
	)
	{
		this.socket.emit(event.event, args, callback)
	}
}

export class Server
{
	socket: BaseServer;

	constructor(socket: BaseServer)
	{
		this.socket = socket
	}

	in(room: SocketRoom)
	{
		return new ServerRoomSocket(this.socket.in(room.room))
	}

	onConnect(callback: (socket: ServerSocket) => void)
	{
		this.socket.on("connect", socket => callback(new ServerSocket(socket)))
	}
}