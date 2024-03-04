import { useForm, useFieldArray, Controller } from "react-hook-form"
import { NumericFormat } from 'react-number-format';
import { PatternFormat } from 'react-number-format';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


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
            <Label>Pet Type</Label>
            <Select
              {...register(
                "petType", 
                {
                  required: true,
                }
              )}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Pet"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unicorn">Unicorn</SelectItem>
                <SelectItem value="dragon">Dragon</SelectItem>
                <SelectItem value="griffin">Griffin</SelectItem>
                <SelectItem value="angel">Angel</SelectItem>
                <SelectItem value="crab">Crab</SelectItem>
                <SelectItem value="tiger">Tiger</SelectItem>
                <SelectItem value="lion">Lion</SelectItem>
                <SelectItem value="rabbit">Rabbit</SelectItem>
                <SelectItem value="fox">Fox</SelectItem>
              </SelectContent>
            </Select>          
          </label>
        </div>
        <div>
          <Controller
            control={control}
            name="levels"
            render={
              ({ field }) => (
                <div>
                  <Label>Levels</Label>
                  <PatternFormat 
                    {...field}
                    type="text"
                    allowEmptyFormatting
                    format="#/#/#/#/#/#/#"
                    customInput={Input}
                  />
                </div>
              )
            }
          />
        </div>
        <div>
          <Label>Stat Goal</Label>
          <Input
            {...register(
              "statGoal", 
              {
                required: true,
                min: 0,
              }
            )}
            type="text"
            inputMode="numeric"
          />
        </div>
        <h2>Prices</h2>
        <h3>Sac Pets</h3>
        <div>
          {
            sacPriceFields.map((field, index: number) => {
              return (              
                <div key={field.tier}>
                  <Label>{field.tier}</Label>
                  <Controller
                    control={control}
                    name={`sacPrice.${index}.price`}
                    rules={{
                      required: true,
                      min: 0,
                    }}
                    render={
                      ({ field }) => (
                        <NumericFormat
                          {...field}
                          type="text"
                          thousandsGroupStyle="thousand"
                          thousandSeparator=","
                          customInput={Input}
                        />
                      )
                    }
                  />
                </div>
              )
            })
          }
        </div>
        <h3>Pet Candy</h3>
        <div>
          {
            candyPriceFields.map((field, index: number) => {
              return (              
                <div key={field.tier}>
                  <Label>{field.tier}</Label>
                  <Controller 
                    control={control}
                    name={`candyPrice.${index}.price`}
                    rules={{
                      required: true,
                      min: 0,
                    }}
                    render={
                      ({ field }) => (
                        <NumericFormat
                          {...field}
                          type="text"
                          thousandsGroupStyle="thousand"
                          thousandSeparator=","
                          customInput={Input}
                        />
                      )
                    }
                  />
                </div>
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