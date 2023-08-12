import { verifyUser } from "@/lib/server/user"
import { setCookieResponseWithStringAsError } from "../cookie"

export async function POST(request: Request)
{
	const data = await request.json()
	const id = await verifyUser(data.username, data.password)
	return setCookieResponseWithStringAsError(id, async (id) => ({ userId: id, password: (await prisma.user.findUnique({ where: { id } }))!.password }))
}