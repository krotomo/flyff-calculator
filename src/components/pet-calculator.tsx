import PetInput from "../components/pet-input"
import PetResults from "../components/pet-results"
import { useState } from "react"

export default function PetCalculator() {
  // form state
  const [ showResults, setShowResults ] = useState<boolean>(false)
  const [ petType, setPetType ] = useState<string>("unicorn")
  const [ statGoal, setStatGoal ] = useState<number>(7162)

  function setPetState(newPetType: string, newStatGoal: number) {
    setPetType(newPetType)
    setStatGoal(newStatGoal)
    setShowResults(true)
  }
  

  return(
    <div>
      <PetInput
        setPetState={setPetState}
      ></PetInput>
      {showResults &&
        <PetResults
          petType={petType}
          statGoal={statGoal}
        ></PetResults>
      }
    </div>
  )
}