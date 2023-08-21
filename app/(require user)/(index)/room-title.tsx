"use client"

import { usePlayerLocation } from "@/lib/client/game-object"
import styles from "./room-title.module.css"

export default function RoomTitle()
{
	const location = usePlayerLocation()
	return <h1 className={styles.header}>You are in {location ? location.props["name"] ?? `#${location.id}` : <span className={styles.null}>null</span>}</h1>
}