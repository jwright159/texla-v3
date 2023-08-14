import { PrismaClient } from "@prisma/client"
import { configDotenv } from "dotenv"

let prisma: PrismaClient

if (process.env.NODE_ENV === "production")
{
	configDotenv({ path: "prisma/.env.prod" })
	prisma = new PrismaClient()
}
else
{
	if (!global.prisma)
	{
		configDotenv({ path: "prisma/.env.dev" })
		global.prisma = new PrismaClient()
	}
	
	prisma = global.prisma
}

export default prisma

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient
}