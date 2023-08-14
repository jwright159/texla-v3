import { FetchEvent, Server, ServerSocket, SubscribeEvent, UnsubscribeEvent, UpdateEvent, UpdateRoom } from "../../websocket-events"
import { PrismaClient } from "@prisma/client"

export type PrismaTable<Original, Include, IncludeResult> = {
	findUnique: (args: {where: {id: number}, include: Include | null}) => Promise<IncludeResult | null>,
	update: (args: {where: {id: number}, include: Include | null, data: Original}) => Promise<IncludeResult>,
}
export type PrismaClientWithTable<TableName extends string, Original, Include extends object = object, IncludeResult extends Original = Original> = PrismaClient & {[x in TableName]: PrismaTable<Original, Include, IncludeResult>}

export const createSubscriptionFromModelIncludingIds = <
	TOriginal extends {id: number},
	TOutput extends object,
> () => <
	TTableName extends string,
	const TMap extends {[x: string]: string},
	TInclude extends {[x in keyof TMap]: boolean},
	TIncludeResult extends TOriginal & {[x in keyof TMap]: {id: number}[]},
	TFinal extends TOriginal & {[x in TMap[keyof TMap]]: number[]},
>(
			io: Server,
			socket: ServerSocket,
			prisma: PrismaClientWithTable<TTableName, TOriginal, TInclude, TIncludeResult>,
			table: TTableName,
			map: TMap,
			selectOutput: (value: TFinal) => TOutput,
		) =>
{
	return createSubscriptionFromModelIncluding<TOriginal, TOutput>()<TTableName, TInclude, TIncludeResult, TFinal>(
		io,
		socket,
		prisma,
		table,
		Object.assign({}, ...Object.keys(map).map(key => ({[key]: true}))),
		(result) => Object.fromEntries([
			...Object.entries(result).filter(([key]) => !Object.keys(map).includes(key)),
			...Object.entries(map).map(([key, value]) => [value, result[key].map(v => v.id)]),
		]),
		selectOutput,
	)
}

export const createSubscriptionFromModelIncluding = <
	TOriginal extends {id: number},
	TOutput extends object,
>() => <
	TTableName extends string,
	TInclude extends object,
	TIncludeResult extends TOriginal,
	TFinal extends TOriginal,
>(
			io: Server,
			socket: ServerSocket,
			prisma: PrismaClientWithTable<TTableName, TOriginal, TInclude, TIncludeResult>,
			table: TTableName,
			include: TInclude,
			includeMap: (value: TIncludeResult) => TFinal,
			selectOutput: (value: TFinal) => TOutput,
		) =>
{
	async function findUniqueMapped(id: number)
	{
		const value = id ? await prisma[table].findUnique({where: {id}, include}) : null
		return value ? includeMap(value) : null
	}
	async function updateMapped(id: number, data: TOriginal)
	{
		const value = id ? await prisma[table].update({where: {id}, include, data}) : null
		return value ? includeMap(value) : null
	}
	return createSubscription<TFinal, TOutput>(io, socket, table, findUniqueMapped, updateMapped, selectOutput)
}

export const createSubscriptionFromModel = <
	TOriginal extends {id: number},
	TOutput extends object,
>() => <
	TTableName extends string,
>(
			io: Server,
			socket: ServerSocket,
			prisma: PrismaClientWithTable<TTableName, TOriginal>,
			table: TTableName,
			selectOutput: (value: TOriginal) => TOutput,
		) =>
{
	return createSubscription<TOriginal, TOutput>(
		io,
		socket,
		table,
		async (id) => id ? await prisma[table].findUnique({where: {id}, include: null}) : null,
		async (id, data) => id ? await prisma[table].update({where: {id}, include: null, data}) : null,
		selectOutput
	)
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
		return value !== null && selectOutput ? selectOutput(value) : null
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