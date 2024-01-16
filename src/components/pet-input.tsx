import { useState } from "react"

export default function PetInput({ setPetState }: {
  setPetState: (petType: string, statGoal: number) => void;
}) {
  const [ petTypeSelect, setPetTypeSelect ] = useState<string>("unicorn")
  const [ statGoalInput, setStatGoalInput ] = useState<{ [key: string]: string }>({
    "unicorn": "7162",
    "dragon": "500",
    "griffin": "450",
    "angel": "31",
    "crab": "45",
    "tiger": "75",
    "lion": "75",
    "rabbit": "75",
    "fox": "75",
  })
  const [ sacPriceInput, setSacPriceInput ] = useState<{ [key: string]: string }>({
    "e": "6",
    "d": "20",
    "c": "57.5",
    "b": "120",
    "a": "220",
    "s": "545",
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPetState(petTypeSelect, parseInt(statGoalInput[petTypeSelect]))
  }

  return(
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Pet Info</h2>
        <div>
          <label>
            Pet Type:
            <select 
              value={petTypeSelect}
              onChange={(e) => setPetTypeSelect(e.target.value)}
            >
              <option value="unicorn">Unicorn</option>
              <option value="dragon">Dragon</option>
              <option value="griffin">Griffin</option>
              <option value="angel">Angel</option>
              <option value="crab">Crab</option>
              <option value="tiger">Tiger</option>
              <option value="lion">Lion</option>
              <option value="rabbit">Rabbit</option>
              <option value="fox">Fox</option>
            </select>
          </label>
          <label>
            Goal:
            <input
              value={statGoalInput[petTypeSelect]}
              type="number"
              onChange={(e) => setStatGoalInput({
                ...statGoalInput, 
                [petTypeSelect]: e.target.value,
              })}
            ></input>
          </label>
        </div>
        <h2>Prices</h2>
        <h3>Sac Pets</h3>
        <div>
          {
            Object.keys(sacPriceInput).map((tier: string) => {
              return (              
                <label key={tier}>
                  {tier}:
                  <input
                    value={sacPriceInput[tier]}
                    type="number"
                    onChange={(e) => setSacPriceInput({
                      ...sacPriceInput,
                      [tier]: e.target.value,
                    })}
                  >
                  </input>
                </label>
              )
            })
          }
        </div>
        <div>
          <button type="submit">Calculate</button>
        </div>
      </form>
    </div>
  )
}