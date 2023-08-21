import { FetchEvent, Server, ServerSocket, SubscribeEvent, UnsubscribeEvent, UpdateEvent, UpdateRoom } from "../../websocket-events"
import { PrismaClient } from "@prisma/client"

export type PrismaTable<Original, Include, IncludeResult> = {
	findUnique: (args: {where: {id: number}, include: Include}) => Promise<IncludeResult | null>,
	update: (args: {where: {id: number}, include: Include, data: Original}) => Promise<IncludeResult>,
}
export type PrismaClientWithTable<TTableName extends TableName, Original, Include extends object = object, IncludeResult extends Original = Original> = PrismaClient & {[x in TTableName]: PrismaTable<Original, Include, IncludeResult>}
export type TableName = string & keyof PrismaClient

export const createSubscriptionFromModel = <
	TOriginal extends {id: number},
	TOutput extends object,
	TIncludeRes extends {[x: string]: object},
>() => <
	TTableName extends TableName,
	TInclude extends {[x in keyof TIncludeRes]: true},
	TIncludeResult extends TOriginal & TIncludeRes,
>(
			io: Server,
			socket: ServerSocket,
			prismaTable: PrismaTable<TOriginal, TInclude, TIncludeResult>,
			table: TTableName,
			include: TInclude,
			selectOutput: (value: TIncludeResult) => TOutput,
		) =>
{
	const findUniqueMapped = async (id: number) => await prismaTable.findUnique({where: {id}, include})
	const updateMapped = async (id: number, data: TOriginal) => await prismaTable.update({where: {id}, include, data})
	return createSubscription<TIncludeResult, TOutput>(io, socket, table, findUniqueMapped, updateMapped, selectOutput)
}

export function createSubscription<
	TOriginal extends {id: number},
	TOutput extends object,
>(
	io: Server,
	socket: ServerSocket,
	table: string,
	findUnique: (id: number) => Promise<TOriginal | null>,
	update: (id: number, data: TOriginal) => Promise<TOriginal | null>,
	selectOutput: (value: TOriginal) => TOutput,
)
{
	const listeners: Record<number, number> = {}

	async function getUpdateValue(id: number)
	{
		const value = await findUnique(id)
		return value !== null ? selectOutput(value) : null
	}

	async function sendUpdate(id: number)
	{
		io.in(UpdateRoom(table, id)).emit(UpdateEvent<TOutput>(table, id), {id, value: await getUpdateValue(id)})
	}

	socket.onPermanentAsync(SubscribeEvent(table), async ({id}) =>
	{
		listeners[id] = (listeners[id] ?? 0) + 1
		if (listeners[id] === 1) socket.join(UpdateRoom(table, id))
		socket.emit(UpdateEvent<TOutput>(table, id), {id, value: await getUpdateValue(id)})
	})

	socket.onPermanent(UnsubscribeEvent(table), ({id}) =>
	{
		listeners[id] = (listeners[id] ?? 0) - 1
		if (listeners[id] === 0) socket.leave(UpdateRoom(table, id))
	})

	socket.onPermanentAsync(FetchEvent<TOutput>(table), async ({id}) =>
	{
		return {body: {value: await getUpdateValue(id)}}
	})

	/*onPermanentAsync(`update-${table}`, async (value: T, callback: () => void) =>
	{
		const id = value.id
		cleanPassword(value)
		value = await update(id, value)
		cleanPassword(value)
		emitEvent(inRoom(io, UpdateRoom(table, value.id)), UpdateEvent<TOutput(table, id)>, {id, value}))
		callback()
	})*/

	return [sendUpdate] as const
}