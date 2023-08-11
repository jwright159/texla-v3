import MainPanel from "../../../components/main-panel"
import { headers } from "next/headers"

export default function NotFound()
{
	const header = headers()

	return (
		<MainPanel
			title={`404 - ${header.get("x-invoke-path")} Not Found`}
		>
			The requested resource was not found on the server.
		</MainPanel>
	)
}