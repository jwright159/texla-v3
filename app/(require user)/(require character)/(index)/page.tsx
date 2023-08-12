import { MainPanel } from "@/components/panel"
import LogoutButton from "../../../login/logout-button"
import LogoutCharacterButton from "../../select-character/logout-character-button"

export default function Index() {
	return (
		<MainPanel title="Hello, world!">
			bepis
			<LogoutButton/>
			<LogoutCharacterButton/>
		</MainPanel>
	)
}
