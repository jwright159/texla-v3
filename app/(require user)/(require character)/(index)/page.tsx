"use client"

import styles from "./page.module.css"
import LoginInfo from "./login-info"
import CharacterList from "./character-list"
import CommandPane from "./command-pane"
import RoomTitle from "./room-title"

export default function Index()
{
	return (
		<main className={styles.main}>
			<RoomTitle/>

			<div className={styles.game}>
				<CommandPane/>
				<CharacterList/>
			</div>

			<LoginInfo/>
		</main>
	)
}