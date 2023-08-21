"use client"

import { useState } from "react"
import styles from "./input-box.module.css"
import pageStyles from "./page.module.css"

export default function InputBox({
	onSend,
}: {
	onSend: (input: string) => void,
})
{
	const [input, setInput] = useState("")

	function send()
	{
		if (!input) return
		onSend(input)
		setInput("")
	}

	return (
		<div className={styles.inputWrapper}>
			<input
				value={input}
				onChange={event => setInput(event.target.value)}
				onKeyDown={event =>
				{
					if (event.key === "Enter")
					{
						event.preventDefault()
						send()
					}
				}}
				className={`${styles.input} ${pageStyles.bordered}`}
				placeholder="Input command..."
			></input>
			<button
				className={styles.submitButton}
				onClick={send}
			>→</button>
		</div>
	)
}