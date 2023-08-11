import { ReactNode } from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ReferrerProvider } from "@/lib/client/referrer"
import { CharacterIdProvider } from "@/lib/context/character-id"
import { UserIdProvider } from "@/lib/context/user-id"
import { WebSocketProvider } from "@/lib/client/websocket"

export const metadata: Metadata = {
	title: "Texla",
	description: "A text-based sandbox MMO RPG engine.",
}

export default async function RootLayout({
	children,
}: {
	children: ReactNode,
}) {
	return (
		<html lang="en">
			<body>
				<ReferrerProvider>
					<UserIdProvider>
						<CharacterIdProvider>
							<WebSocketProvider>
								{children}
							</WebSocketProvider>
						</CharacterIdProvider>
					</UserIdProvider>
				</ReferrerProvider>
			</body>
		</html>
	)
}