import { useState, useRef, useEffect, FormEvent } from "react";
import { useForm, useFieldArray } from "react-hook-form"

type FormValues = {
  petType: string,
  levels: string,
  statGoal: string,
  sacPrice: {
    tier: string,
    price: string,
  }[],
  candyPrice: {
    tier: string,
    price: string,
  }[],
}

const statRange: { [key: string]: { min: number, max: number } } = {
  "unicorn": { min: 78, max: 7182 },
  "dragon": { min: 7, max: 500 },
  "griffin": { min: 6, max: 450 },
  "angel": { min: 1, max: 31 },
  "crab": { min: 2, max: 45 },
  "tiger": { min: 1, max: 75 },
  "lion": { min: 1, max: 75 },
  "rabbit": { min: 1, max: 75 },
  "fox": { min: 1, max: 75 },
}

const numberFormat = new Intl.NumberFormat('en-US')

function LevelInput() { 
  function format(input: string): string {
    const digitsOnly = input.replace(/[^0-9]/g, "")
    return [...digitsOnly].slice(0, 7).join("/")
  }
  return FormattedNumberInput(format)
}

function SeparatedNumberInput() {
  function format(input: string): string {
    const digitsOnly = input.replace(/[^0-9]/g, "")
    return numberFormat.format(Number(digitsOnly))
  }
  return FormattedNumberInput(format)
}

function FormattedNumberInput(format: (input: string) => string) {
  const [value, setValue] = useState<string>("")
  const [cursorIndex, setCursorIndex] = useState({ value: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  function countDigits(input: string): number {
    return (input.match(/\d/g) || []).length
  }

  function handleChange(event: FormEvent) {
    const {value: inputValue, selectionStart} = event.target as HTMLTextAreaElement

    if (countDigits(inputValue) === 0) {
      setValue("")
      return
    }

    const newValue = format(inputValue)
    const numDigitsBeforeCursor = countDigits(inputValue.slice(0, selectionStart))

    setValue(newValue)

    if (numDigitsBeforeCursor === 0) {
      setCursorIndex({ value: 0 })
      return
    }

    let numDigitsFound = 0
    let newCursorIndex = newValue.length
    for(let i = 0; i < newValue.length; i++) {
      if (/\d/.test(newValue[i])) {
        numDigitsFound++
      }
      if (numDigitsFound === numDigitsBeforeCursor) {
        newCursorIndex = i + 1
        break
      }
    }

    setCursorIndex({ value: newCursorIndex })
  }

  useEffect(() => {
    console.log("render!")
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursorIndex.value, cursorIndex.value);
    }
  }, [cursorIndex]);

  return(
    <input
      value={value}
      ref={inputRef}
      inputMode="numeric"
      onChange={handleChange}
    ></input>
  )
}

function PetInput({ setPetState }: {
  setPetState: (
    petType: string, 
    levels: number[], 
    statGoal: number, 
    sacPrices: {[key: string]: number}, 
    candyPrices: {[key: string]: number}
  ) => void;
}) {
  const defaultValues : FormValues = {
    petType: "",
    levels: "1",
    statGoal: "",
    sacPrice: [
      { tier: "e", price: "6000000" },
      { tier: "d", price: "20000000" },
      { tier: "c", price: "57500000" },
      { tier: "b", price: "120000000" },
      { tier: "a", price: "220000000" },
      { tier: "s", price: "545000000" },
    ],
    candyPrice: [
      { tier: "f", price: "200000" },
      { tier: "e", price: "700000" },
      { tier: "d", price: "1500000" },
      { tier: "c", price: "2500000" },
      { tier: "b", price: "4000000" },
      { tier: "a", price: "6500000" },
    ]
  }

  const statNameByPetType: { [key: string]: string } = {
    "unicorn": "HP",
    "dragon": "Attack",
    "griffin": "DEF",
    "angel": "% Critical Chance",
    "crab": "% Critical Damage",
    "tiger": "STR",
    "lion": "STA",
    "rabbit": "DEX",
    "fox": "INT",
  }

  const { control, register, watch, handleSubmit } = useForm({
    defaultValues: defaultValues
  })
  const { fields: sacPriceFields } = useFieldArray({
    control: control,
    name: "sacPrice",
  })
  const { fields: candyPriceFields } = useFieldArray({
    control: control,
    name: "candyPrice",
  })

  const petType = watch("petType")

  function onSubmit(formData : FormValues) {
    const levels = []
    for (const level of formData.levels) {
      if (!isNaN(parseInt(level))) {
        levels.push(parseInt(level))
      }
    }
    const statGoal = parseInt(formData.statGoal)
    const sacPrices: {[key: string]: number} = {}
    for (const priceObject of formData.sacPrice) {
      sacPrices[priceObject.tier] = parseInt(priceObject.price)
    }
    const candyPrices: {[key: string]: number} = {}
    for (const priceObject of formData.candyPrice) {
      candyPrices[priceObject.tier] = parseInt(priceObject.price)
    }
    setPetState(
      formData.petType,
      levels,
      statGoal,
      sacPrices,
      candyPrices,
    )
  }

  return(
    <div>
      <form onSubmit={handleSubmit((formData) => onSubmit(formData))}>
        <h2>Pet Info</h2>
        <div>
          <label>
            Pet Type:
            <select 
              {...register(
                "petType", 
                {
                  required: true,
                }
              )}
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
        </div>
        <div>
          <label>
            Levels:
            <input
              {...register(
                "levels",
                {
                  required: true,
                  min: 1,
                  max: 1234579,
                }
              )}
            >
            </input>
          </label>
        </div>
        <div>
          <label>
            Goal:
              <SeparatedNumberInput />
            { statNameByPetType[petType] }
          </label>
        </div>
        <h2>Prices</h2>
        <h3>Sac Pets</h3>
        <div>
          {
            sacPriceFields.map((field, index: number) => {
              return (              
                <label key={field.tier}>
                  {field.tier}:
                  <input
                    {
                      ...register(
                        (`sacPrice.${index}.price`),
                        {
                          required: true,
                          min: 0,
                        }
                      )
                    }
                    type="number"
                  >
                  </input>
                </label>
              )
            })
          }
        </div>
        <h3>Pet Candy</h3>
        <div>
          {
            candyPriceFields.map((field, index: number) => {
              return (              
                <label key={field.tier}>
                  {field.tier}:
                  <input
                    {
                      ...register(
                        (`candyPrice.${index}.price` as const),
                        {
                          required: true,
                          min: 0,
                        }
                      )
                    }
                    type="number"
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

export { PetInput }