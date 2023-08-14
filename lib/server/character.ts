export const loggedInCharacterIds: number[] = []

export async function verifyCharacter(userId: number, id: number)
{
	if (!userId) return "Not logged in"
	if (typeof id !== "number") return "ID must be a number"
	if (isNaN(id)) return "Must select a character"

	if (id === 0) return 0

	if (id in loggedInCharacterIds) return "Character already logged in"

	const character = await prisma.character.findUnique({ where: { id } })
	if (!character) return "No character with that ID"
	if (character.userId != userId) return "You do not own that character"

	return character.id
}

export async function registerCharacter(userId: number, name: string)
{
	if (!userId) return "Not logged in"
	if (!name) return "Name cannot be empty"

	const character = await prisma.character.create({ data: {
		user: { connect: { id: userId } },
		name,
	}})
	
	return character.id
}

export async function deleteCharacter(userId: number, id: number)
{
	if (!userId) return "Not logged in"
	if (typeof id !== "number") return "ID must be a number"
	if (isNaN(id)) return "Must select a character"

	const character = await prisma.character.findUnique({ where: { id } })
	if (!character) return "No character with that ID"
	if (character.userId != userId) return "You do not own that character"

	const delCharacter = await prisma.character.delete({ where: { id } })

	return delCharacter.id
}

export async function parseCharacterId(userId: number, cookieData: any): Promise<number>
{
	if (!userId || !cookieData) return 0

	const { characterId } = cookieData

	if (!characterId || typeof characterId !== "number") return 0

	const character = await prisma.character.findUnique({
		where: {
			id: characterId
		}
	})
	if (!character || character.userId != userId) return 0

	return characterId
}