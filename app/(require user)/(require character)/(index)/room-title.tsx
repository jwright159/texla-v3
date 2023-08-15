"use client"

import { usePlayerRoom } from "@/lib/client/room"
import styles from "./room-title.module.css"

export default function RoomTitle()
{
	const room = usePlayerRoom()
	return <h1 className={styles.header}>You are in {room?.name ?? "null"}</h1>
}