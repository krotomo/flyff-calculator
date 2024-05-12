import { PetInput } from "../components/pet-input"
import PetResults from "../components/pet-results"
import { useState } from "react"
import flyffLogo from "../assets/flyff.png"

export default function PetCalculator() {
  // form state
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
  }
  

  return(
    <div className="max-w-screen-xl p-8 m-auto flex justify-center">
      <div className="lg:w-3/4">
        <div className="flex flex-col items-center">
          <img className="w-48" src={flyffLogo}></img>
          <h1 className="text-center text-4xl font-bold mb-4">Petulator</h1>
        </div>
        <div className="sm:flex">
          <div className="basis-1/2">
            <h2 className="text-center text-primary text-3xl font-semibold my-4">Pet Info</h2>
            <PetInput
              setPetState={setPetState}
            ></PetInput>
          </div>
          <div className="basis-1/2">
            <h2 className="text-center text-primary text-3xl font-semibold my-4">Results</h2>
            <PetResults
              petType={petType}
              levels={levels!}
              exp={exp!}
              statGoal={statGoal!}
              levelsGoal={levelsGoal!}
              sacPrices={sacPrices!}
              candyPrices={candyPrices!}
            ></PetResults>
          </div>
        </div>
        <div className="m-4 mt-8 text-primary opacity-60">Made by krotomo using data and assets belonging to Gala Lab Corp</div>
      </div>
    </div>
  )
}