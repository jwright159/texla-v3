"use server"

import { sealData, unsealData } from "iron-session"
import { cookies } from "next/headers"

const cookieName = process.env.SESSION_COOKIE as string
const cookiePassword = process.env.SESSION_PASSWORD as string // 32 character password from https://1password.com/password-generator/

interface CookieData
{
	userId?: number,
	password?: string,
	characterId?: number,
}

const getCookie = () => cookies().get(cookieName)?.value ?? ""

export async function sealCookie(data: CookieData)
{
	const cookie = await sealCookieAgnostic(data, getCookie())
	cookies().set(cookieName, cookie)
}

export async function unsealCookie(): Promise<CookieData>
{
	return unsealCookieAgnostic(getCookie())
}

export async function sealCookieAgnostic(data: {}, currentCookie: string)
{
	if (!cookiePassword) throw new Error("Session password not set")
	const cookie = await sealData({
		...await unsealCookieAgnostic(currentCookie),
		...data,
	}, {password: cookiePassword})
	return cookie
}

export async function unsealCookieAgnostic(cookie: string): Promise<{}>
{
	if (!cookiePassword) throw new Error("Session password not set")
	if (!cookie) return {}

	const cookieData = await unsealData<{}>(cookie, {password: cookiePassword})
	if (!cookieData || typeof cookieData !== "object") return {}

	return cookieData
}