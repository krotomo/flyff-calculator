import { PetInput } from "../components/pet-input"
import PetResults from "../components/pet-results"
import { useState } from "react"

export default function PetCalculator() {
  // form state
  const [ showResults, setShowResults ] = useState<boolean>(false)
  const [ petType, setPetType ] = useState<string>()
  const [ levels, setLevels ] = useState<number[]>()
  const [ statGoal, setStatGoal ] = useState<number>()
  const [ levelsGoal, setLevelsGoal ] = useState<number[]>()
  const [ sacPrices, setSacPrices ] = useState<{[key: string]: number}>()
  const [ candyPrices, setCandyPrices ] = useState<{[key: string]: number}>()

  function setPetState(
    newPetType: string, 
    newLevels: number[], 
    newStatGoal: number, 
    newLevelsGoal: number[],
    newSacPrices: {[key: string]: number},
    newCandyPrices: {[key: string]: number},
  ) {
    setPetType(newPetType)
    setLevels(newLevels)
    setStatGoal(newStatGoal)
    setLevelsGoal(newLevelsGoal)
    setSacPrices(newSacPrices)
    setCandyPrices(newCandyPrices)
    setShowResults(true)
  }
  

  return(
    <div>
      <h1>Pet Cost Calculator</h1>
      <div className="flex justify-center">
        <div className="basis-1/2 max-w-md">
          <PetInput
            setPetState={setPetState}
          ></PetInput>
        </div>
        {showResults &&
          <PetResults
            petType={petType}
            levels={levels}
            statGoal={statGoal}
            levelsGoal={levelsGoal}
            sacPrices={sacPrices}
            candyPrices={candyPrices}
          ></PetResults>
        }
        {!showResults &&
          <div className="basis-1/2 max-w-md" />
        }
      </div>
    </div>
  )
}