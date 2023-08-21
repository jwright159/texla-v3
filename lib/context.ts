export interface User {
	id: number
	username: string
	objectIds: number[]
}

export interface GameObject {
	id: number
	userId: number
	contentsIds: number[]
	locationId: number
	props: Record<string, string>
}