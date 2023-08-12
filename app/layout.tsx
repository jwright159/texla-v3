import { ReactNode } from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ReferrerProvider } from "@/lib/client/referrer"
import { WebSocketProvider } from "@/lib/client/websocket"
import { CharacterIdProvider } from "@/lib/client/character-id"
import { UserIdProvider } from "@/lib/client/user-id"
import { unsealNextCookie } from "@/lib/server/cookies"

export const metadata: Metadata = {
	title: "Texla",
	description: "A text-based sandbox MMO RPG engine.",
}

export default async function RootLayout({
	children,
}: {
	children: ReactNode,
}) {
	const cookie = await unsealNextCookie()

	return (
		<html lang="en">
			<body>
				<ReferrerProvider>
					<UserIdProvider initialId={cookie.userId ?? 0}>
						<CharacterIdProvider initialId={cookie.characterId ?? 0}>
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