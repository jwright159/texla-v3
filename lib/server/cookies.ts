import { sealData, unsealData } from "iron-session"
import { cookies } from "next/headers"
import { Socket } from "socket.io"
import { parse as parseCookie } from "cookie"

export const cookieName = process.env.SESSION_COOKIE as string
export const cookiePassword = process.env.SESSION_PASSWORD as string // 32 character password from https://1password.com/password-generator/

export interface CookieData
{
	userId?: number,
	password?: string,
	characterId?: number,
}

export async function sealCookie(data: CookieData, currentCookie: string)
{
	if (!cookiePassword) throw new Error("Session password not set")
	const cookie = await sealData({
		...await unsealCookie(currentCookie),
		...data,
	}, {password: cookiePassword})
	return cookie
}

export async function unsealCookie(cookie: string): Promise<CookieData>
{
	if (!cookiePassword) throw new Error("Session password not set")
	if (!cookie) return {}

	const cookieData = await unsealData<{}>(cookie, {password: cookiePassword})
	if (!cookieData || typeof cookieData !== "object") return {}

	return cookieData
}

const getNextCookie = () => cookies().get(cookieName)?.value ?? ""
export async function sealNextCookie(data: CookieData)
{
	const cookie = await sealCookie(data, getNextCookie())
	return `${cookieName}=${cookie}; Path=/`
}
export async function unsealNextCookie(): Promise<CookieData>
{
	return unsealCookie(getNextCookie())
}

const getSocketCookie = (socket: Socket) => parseCookie(socket.handshake.headers.cookie ?? "")[cookieName] ?? ""
/* export async function sealSocketCookie(socket: Socket, data: CookieData)
{
	const cookie = await sealCookie(data, getSocketCookie(socket))
	// ????
} */
export async function unsealSocketCookie(socket: Socket): Promise<CookieData>
{
	return unsealCookie(getSocketCookie(socket))
}
