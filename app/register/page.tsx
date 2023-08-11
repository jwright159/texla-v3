import MainPanel from "@/components/main-panel"
import RegisterForm from "./register-form"
import Link from "next/link"

export default async function Login()
{
	return (
		<MainPanel title="Register">
			<RegisterForm/>
			<p><Link href="/login">Login</Link></p>
		</MainPanel>
	)
}