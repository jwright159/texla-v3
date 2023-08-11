"use server"

import bcrypt from "bcrypt"

export async function loginUser(username: string, password: string)
{
	const user = await prisma.user.findUnique({ where: { username } })
	if (!user) return "Wrong username or password"

	const passwordCorrect = await bcrypt.compare(password, user.password)
	if (!passwordCorrect) return "Wrong username or password"
	
	return user
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

	return user
}