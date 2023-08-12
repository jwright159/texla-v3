import { sealNextCookie } from "@/lib/server/cookies"

export async function POST()
{
	return new Response("", {
		status: 200,
		headers: { "Set-Cookie": await sealNextCookie({ userId: undefined, password: undefined }) },
	})
}