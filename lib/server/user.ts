import bcrypt from "bcrypt"
import prisma from "./prisma"

export async function verifyUser(username: string, password: string)
{
	if (typeof username !== "string") return "Username must be a string"
	if (typeof password !== "string") return "Password must be a string"

	const user = await prisma.user.findUnique({ where: { username } })
	if (!user) return "Wrong username or password"

	const passwordCorrect = await bcrypt.compare(password, user.password)
	if (!passwordCorrect) return "Wrong username or password"
	
	return user.id
}

export async function registerUser(username: string, password: string)
{
	if (!username) return "Username cannot be empty"

	if (password.length < 8) return "Password must be at least 8 characters"

	const existingUser = await prisma.user.findUnique({ where: { username } })
	if (existingUser) return "Username taken"

	const passwordHash = await bcrypt.hash(password, 10)

	const user = await prisma.user.create({ data: {
		username,
		password: passwordHash,
	}})

	return user.id
}

export async function parseUserId(cookieData: {userId?: number, password?: string})
{
	if (!cookieData) return 0

	const { userId, password } = cookieData

	if (!userId || typeof userId !== "number") return 0
	if (!password || typeof password !== "string") return 0

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
			password
		}
	})
	if (!user) return 0

	return userId
}