import { PetInput } from "../components/pet-input"
import PetResults from "../components/pet-results"
import { useState } from "react"

export default function PetCalculator() {
  // form state
  const [ showResults, setShowResults ] = useState<boolean>(false)
  const [ petType, setPetType ] = useState<Pet>()
  const [ levels, setLevels ] = useState<number[]>()
  const [ exp, setExp ] = useState<number>()
  const [ statGoal, setStatGoal ] = useState<number>()
  const [ levelsGoal, setLevelsGoal ] = useState<number[]>()
  const [ sacPrices, setSacPrices ] = useState<Record<SacTier, number>>()
  const [ candyPrices, setCandyPrices ] = useState<Record<RaiseTier, number>>()

  function setPetState(
    newPetType: Pet, 
    newLevels: number[], 
    newExp: number,
    newStatGoal: number, 
    newLevelsGoal: number[],
    newSacPrices: Record<SacTier, number>,
    newCandyPrices: Record<RaiseTier, number>,
  ) {
    setPetType(newPetType)
    setLevels(newLevels)
    setExp(newExp)
    setStatGoal(newStatGoal)
    setLevelsGoal(newLevelsGoal)
    setSacPrices(newSacPrices)
    setCandyPrices(newCandyPrices)
    setShowResults(true)
  }
  

  return(
    <div>
      <h1 className="text-4xl font-bold mb-4">Pet Cost Calculator</h1>
      <div className="flex justify-center">
        <div className="basis-1/3 max-w-md">
          <h2 className="text-3xl my-4 font-semibold">Pet Info</h2>
          <PetInput
            setPetState={setPetState}
          ></PetInput>
        </div>
        <div className="basis-1/3 max-w-md">
          <h2 className="text-3xl font-semibold my-4">Results</h2>
          <PetResults
            petType={petType}
            levels={levels}
            exp={exp}
            statGoal={statGoal}
            levelsGoal={levelsGoal}
            sacPrices={sacPrices}
            candyPrices={candyPrices}
          ></PetResults>
        </div>
      </div>
    </div>
  )
}