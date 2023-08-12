import { MainPanel } from "@/components/panel"
import LoginCharacterForm from "./login-character-form"
import Link from "next/link"
import LogoutButton from "../../login/logout-button"

export default function SelectCharacter()
{
	return (
		<MainPanel title="Select Character">
			<LoginCharacterForm/>
			<p><Link href="/register-character">Register character</Link></p>
			<LogoutButton/>
		</MainPanel>
	)
}