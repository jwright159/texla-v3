import { CookieData, sealNextCookie } from "@/lib/server/cookies"

export async function setCookieResponseWithStringAsError<T>(arg: T | string, dataMap: (arg: T) => Promise<CookieData>)
{
	if (typeof arg === "string")
		return new Response(arg, {
			status: 400,
		})
	else
		return new Response("", {
			status: 200,
			headers: { "Set-Cookie": await sealNextCookie(await dataMap(arg)) },
		})
}