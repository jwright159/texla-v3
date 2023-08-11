import { User } from "@prisma/client"

export async function loginCharacter(id: number)
{
	if (isNaN(id)) return "Must select a character"

	const character = await prisma.character.findUnique({ where: { id } })
	if (!character) return "No character with that ID"
	
	return character
}

export async function registerCharacter(user: User, name: string)
{
	if (!name) return "Name cannot be empty"

	const character = await prisma.character.create({ data: {
		user: { connect: { id: user.id } },
		name,
	}})
	
	return character
}

export async function deleteCharacter(id: number)
{
	const resCharacter = await prisma.character.delete({where: {id}})
	return resCharacter
}