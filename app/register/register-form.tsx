"use client"

import { useLoginUser } from "@/lib/context/user-id"

export default function RegisterForm()
{
	const {isPending, errorText, register} = useLoginUser()

	return (
		<form onSubmit={event => {
			event.preventDefault()
			const username = `${event.currentTarget.username.value}`
			const password = `${event.currentTarget.password.value}`
			register(username, password)
		}}>
			<p><label htmlFor="username">Username:</label> <input id="username" name="username" disabled={isPending}/></p>
			<p><label htmlFor="password">Password:</label> <input type="password" id="password" name="password" disabled={isPending}/></p>

			<input type="submit" value="Register" disabled={isPending}/>

			<p style={{ color: "red" }}>{errorText}</p>
		</form>
	)
}
