"use client"

import MainPanel from "@/components/main-panel"
import { usePlayerCharacter } from "@/lib/context/character"
import { useWebSocket } from "@/lib/client/websocket"
import { useEffect, useState } from "react"

export default function Pesterchum()
{
	const socket = useWebSocket()

	const character = usePlayerCharacter()

	const [messageText, setMessageText] = useState("")
	const [messages, setMessages] = useState<{id: number, text: string}[]>([])

	const recieveMessage = (message: any) => setMessages(messages => [...messages, {id: message.id, text: `[${message.sender}] ${message.text}`}])
	const recieveJoin = (message: any) => setMessages(messages => [...messages, {id: message.id, text: `--- ${message.sender} joined the chat! ---`}])
	const recieveLeave = (message: any) => setMessages(messages => [...messages, {id: message.id, text: `--- ${message.sender} left the chat! ---`}])

	useEffect(() =>
	{
		if (!character) return

		socket.on("send-message", recieveMessage)
		socket.on("join-chat", recieveJoin)
		socket.on("leave-chat", recieveLeave)
		socket.emit("join-chat", character.name)

		return () =>
		{
			socket.emit("leave-chat")
			socket.off("send-message", recieveMessage)
			socket.off("join-chat", recieveJoin)
			socket.off("leave-chat", recieveLeave)
		}
	}, [socket, character?.id])

	function submitMessage()
	{
		if (!character || !messageText) return
		socket.emit("send-message", {sender: character.name, text: messageText})
		setMessageText("")
	}

	return (
		<MainPanel title="Pesterchum?">
			{character ? <p>Logged in as {character.name}</p> : <p>Logging in...</p>}

			<div>
				<input
					value={messageText}
					onChange={event => setMessageText(event.currentTarget.value)}
					onKeyDown={event =>
					{
						if (event.key === "Enter")
						{
							event.preventDefault()
							submitMessage()
						}
					}}
				></input>
				<button onClick={submitMessage}>Send</button>
			</div>

			<ul>
				{messages.map(message => <li key={message.id}>{message.text}</li>)}
			</ul>
		</MainPanel>
	)
}