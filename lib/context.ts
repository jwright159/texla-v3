export interface User {
	id: number;
	username: string;
	characterIds: number[];
	roomIds: number[];
}

export interface Character {
	id: number;
	name: string;
	roomId: number;
	userId: number;
}

export interface Room {
	id: number;
	userId: number;
	name: string;
	characterIds: number[];
}