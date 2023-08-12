import { configDotenv } from "dotenv"
configDotenv({path: "./.env.local"})

import { createServer } from "http"
import next from "next"
import { Server } from "socket.io"
import setupWebSocketServer from "./lib/server/websocket"

// FIXME: In case hot module reloading breaks again, https://github.com/vercel/next.js/issues/50461

(async () => {
	const dev = process.env.NODE_ENV !== "production"
	const port = 3000

	const app = next({ dev })
	const handleRequest = app.getRequestHandler()
	const handleUpgrade = app.getUpgradeHandler()
	await app.prepare()

	const httpServer = createServer()
	httpServer.on("request", handleRequest)
	httpServer.on("upgrade", handleUpgrade)

	const io = new Server(httpServer)
	setupWebSocketServer(io)

	httpServer.listen(port, () => {
		console.log(`- listening on port ${port}`)
	})
})()