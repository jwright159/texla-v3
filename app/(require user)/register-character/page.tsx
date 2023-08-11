import MainPanel from "@/components/main-panel"
import RegisterCharacterForm from "@/app/(logged in menu)/register-character/register-character-form"
import Link from "next/link"

export default function RegisterCharacter()
{
	return (
		<MainPanel title="Register Character">
			<RegisterCharacterForm/>
			<p><Link href="/select-character">Select character</Link></p>
		</MainPanel>
	)
}