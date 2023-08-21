import { ReactNode } from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ReferrerProvider } from "@/lib/client/referrer"
import { WebSocketProvider } from "@/lib/client/websocket"
import { UserIdProvider } from "@/lib/client/user-id"
import { unsealNextCookie } from "@/lib/server/cookies"
import { parseUserId } from "@/lib/server/user"

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
	const userId = await parseUserId(cookie)

	return (
		<html lang="en">
			<body>
				<ReferrerProvider>
					<UserIdProvider initialId={userId}>
						<WebSocketProvider>
							{children}
						</WebSocketProvider>
					</UserIdProvider>
				</ReferrerProvider>
			</body>
		</html>
	)
}