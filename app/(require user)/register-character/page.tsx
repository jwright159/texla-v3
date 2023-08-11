import { MainPanel } from "@/components/panel"
import Link from "next/link"
import RegisterCharacterForm from "./register-character-form"

export default function RegisterCharacter()
{
	return (
		<MainPanel title="Register Character">
			<RegisterCharacterForm/>
			<p><Link href="/select-character">Select character</Link></p>
		</MainPanel>
	)
}