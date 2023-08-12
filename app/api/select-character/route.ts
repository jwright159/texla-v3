import { verifyCharacter } from "@/lib/server/character"
import { setCookieResponseWithStringAsError } from "../cookie"
import { unsealNextCookie } from "@/lib/server/cookies"
import { parseUserId } from "@/lib/server/user"

export async function POST(request: Request)
{
	const data = await request.json()
	const id = await verifyCharacter(await parseUserId(await unsealNextCookie()), data.id)
	return setCookieResponseWithStringAsError(id, async (id) => ({ characterId: id }))
}