import { PrismaClient } from "@prisma/client"
import { Server, Socket } from "socket.io"

export type PrismaTable<Original, Include, IncludeResult> = {
	findUnique: (args: {where: {id: number}, include: Include | null}) => Promise<IncludeResult | null>,
	update: (args: {where: {id: number}, include: Include | null, data: Original}) => Promise<IncludeResult>,
}
export type PrismaClientWithTable<TableName extends string, Original, Include = {}, IncludeResult = Original> = PrismaClient & {[x in TableName]: PrismaTable<Original, Include, IncludeResult>}

export function createSubscriptionFromModelIncludingIds<
	TMap extends {[x: string]: string},
	TOriginal extends {id: number},
	TInclude extends {[x in keyof TMap]: boolean},
	TIncludeResult extends TOriginal & {[x in keyof TMap]: {id: number}[]},
	TFinal extends TOriginal & {[x in TMap[keyof TMap]]: number[]},
	TTableName extends string,
>(
	io: Server,
	socket: Socket,
	prisma: PrismaClientWithTable<TTableName, TOriginal, TInclude, TIncludeResult>,
	table: TTableName,
	map: TMap,
)
{
	return createSubscriptionFromModelIncluding<TOriginal, TInclude, TIncludeResult, TFinal, TTableName>(
		io,
		socket,
		prisma,
		table,
		Object.assign({}, ...Object.keys(map).map(key => ({[key]: true}))),
		(result) => Object.fromEntries([
				...Object.entries(result).filter(([key, value]) => !Object.keys(map).includes(key)),
				...Object.entries(map).map(([key, value]) => [value, result[key].map(v => v.id)]),
		]),
	)
}

export function createSubscriptionFromModelIncluding<
	TOriginal extends {id: number},
	TInclude extends {},
	TIncludeResult extends TOriginal,
	TFinal extends TOriginal,
	TTableName extends string,
>(
	io: Server,
	socket: Socket,
	prisma: PrismaClientWithTable<TTableName, TOriginal, TInclude, TIncludeResult>,
	table: TTableName,
	include: TInclude,
	includeMap: (value: TIncludeResult) => TFinal,
)
{
	async function findUniqueMapped(id: number)
	{
		const value = await prisma[table].findUnique({where: {id}, include})
		return value ? includeMap(value) : null
	}
	async function updateMapped(id: number, data: TOriginal)
	{
		const value = await prisma[table].update({where: {id}, include, data})
		return includeMap(value)
	}
	createSubscription<TFinal>(io, socket, table, findUniqueMapped, updateMapped)
}

export function createSubscriptionFromModel<T extends {id: number}, TTableName extends string>(
	io: Server,
	socket: Socket,
	prisma: PrismaClientWithTable<TTableName, T>,
	table: TTableName,
)
{
	createSubscription<T>(io, socket, table, (id) => prisma[table].findUnique({where: {id}, include: null}), (id, data) => prisma[table].update({where: {id}, include: null, data}))
}

export function createSubscription<T extends {id: number}>(
	io: Server,
	socket: Socket,
	table: string,
	findUnique: (id: number) => Promise<T | null>,
	update: (id: number, data: any) => Promise<T>,
)
{
	const listeners: Record<number, number> = {}

	socket.on(`subscribe-${table}`, async (id: number) =>
	{
		listeners[id] = (listeners[id] ?? 0) + 1
		if (listeners[id] === 1) socket.join(`update-${table}-${id}`)

		const value = await findUnique(id)
		cleanPassword(value)
		socket.emit(`update-${table}-${id}`, {id, value})
	})

	socket.on(`unsubscribe-${table}`, (id: number) =>
	{
		listeners[id] = (listeners[id] ?? 0) - 1
		if (listeners[id] === 0) socket.leave(`update-${table}-${id}`)
	})

	socket.on(`update-${table}`, async (value: T, callback: () => void) =>
	{
		const id = value.id
		cleanPassword(value)
		value = await update(id, value)
		cleanPassword(value)
		io.in(`update-${table}-${value.id}`).emit(`update-${table}-${id}`, {id, value})
		callback()
	})
}

function cleanPassword(data: any)
{
	if (data && 'password' in data) delete data.password
}