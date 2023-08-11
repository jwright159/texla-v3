"use client"

import MainPanel from "@/components/main-panel"
import { usePlayerCharacter } from "@/lib/context/character"
import { useDeleteCharacter } from "@/lib/context/character-id"
import { usePlayerEntity, useEntityState } from "@/lib/context/entity"
import { useState } from "react"

export default function Overview()
{
	const character = usePlayerCharacter()!
	const entity = usePlayerEntity()!
	
	const [power, setPower] = useEntityState(entity, "power")
	const [powerInput, setPowerInput] = useState(power)

	const isPending = false;

	const [isDeletePending, deleteCharacter] = useDeleteCharacter()
	
	return (
		<MainPanel title="Character Overview">
			<form onSubmit={(event) => {
				event.preventDefault()
				setPower(powerInput)
			}}>
				Current Power: {entity.power}
				<div>
					<label htmlFor="power">Power:</label> <input type="number" id="power" name="power" value={powerInput} onChange={event => setPowerInput(parseInt(event.target.value))} disabled={isPending}/>
				</div>

				<input type="submit" value="Submit" disabled={isPending}/>
			</form>

			<div style={{ margin: 20, border: "red 2px solid", padding: 20 }}>
				<button onClick={() => deleteCharacter(character.id)} disabled={isDeletePending}>Delete character</button>
			</div>
		</MainPanel>
	)
}
