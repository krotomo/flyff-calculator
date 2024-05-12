import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { NumericFormat } from 'react-number-format';
import { PatternFormat } from 'react-number-format';
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const statNameByPetType: Record<Pet, string> = {
  "unicorn": " HP",
  "dragon": " Attack",
  "griffin": " Defense",
  "angel": "% Critical Chance",
  "crab": "% Critical Damage",
  "tiger": " STR",
  "lion": " STA",
  "rabbit": " DEX",
  "fox": " INT",
}

const tiers: Tier[] = ["egg", "f", "e", "d", "c", "b", "a", "s"]

const statsByPetType: Record<Pet, number[]> = {
  "unicorn": [96, 191, 383, 670, 1053, 1356, 1628, 2539, 3161],
  "dragon": [7, 13, 27, 47, 73, 95, 113, 165, 220],
  "angel": [1, 2, 3, 4, 5, 6, 7, 8, 9],
  "griffin": [6, 12, 24, 42, 66, 88, 102, 140, 198],
  "fox": [1, 2, 4, 7, 11, 15, 17, 24, 33],
  "rabbit": [1, 2, 4, 7, 11, 15, 17, 24, 33],
  "tiger": [1, 2, 4, 7, 11, 15, 17, 24, 33],
  "crab": [2, 3, 4, 5, 6, 7, 9, 11, 16],
  "lion": [1, 2, 4, 7, 11, 15, 17, 24, 33]
}

const statRange: Record<Pet, { min: number, max: number }> = {} as Record<Pet, { min: number, max: number }>
Object.keys(statsByPetType).forEach((petType) => {
  statRange[petType as Pet] = {
    min: statsByPetType[petType as Pet][0],
    max: [0, 1, 2, 3, 4, 6, 8].reduce((acc, curr) => {
      return acc + statsByPetType[petType as Pet][curr]
    }, 0)
  }
})

function statsTotal(state: number[], petType: Pet): number {
  let sum = 0
  for (const level of state) {
    sum += statsByPetType[petType][level-1]
  }
  return sum
}

const defaultValues = {
  petType: "",
  levels: "",
  exp: "",
  statGoal: "",
  levelsGoal: "",
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

function getInitialValues() {
  const localSacPrice = localStorage.getItem("sacPrice")
  const localCandyPrice = localStorage.getItem("candyPrice")
  try {
    return {
      ...defaultValues,
      sacPrice: localSacPrice ? JSON.parse(localSacPrice) : defaultValues.sacPrice,
      candyPrice: localCandyPrice ? JSON.parse(localCandyPrice) : defaultValues.candyPrice,
    }
  }
  catch (error) {
    return defaultValues
  }
}

const levelsRegex = /(^$)|(^(1| )\/([1-2]| )\/([1-3]| )\/([1-4]| )\/([1-5]| )\/([1-7]| )\/([1-9]| )$)/

const formSchema = z.object({
  petType: z.string()
    .min(1, "Field is required."),
  levels: z.string()
    .regex(
      levelsRegex,
      "Please enter valid levels."
    ),
  exp: z.string()
    .refine(
      (val) => {
        if (!val) return true
        const expNumber = parseFloat(val)
        return(expNumber >= 0 && expNumber <= 100)
      }, 
      { message: "Must be between 0 and 100." }
    ),
  statGoal: z.string(),
  levelsGoal: z.string()
    .regex(
      levelsRegex,
      "Please enter valid levels."
    ),
  sacPrice: z.array(z.object({
    tier: z.string(),
    price: z.string()
      .min(1, "Field is required.")
      .refine(
        (val) => {
          return(stringIsInteger(val))
        }, 
        { message: "Please enter a valid number." }
      ),
  })),
  candyPrice: z.array(z.object({
    tier: z.string(),
    price: z.string()
      .min(1, "Field is required.")
      .refine(
        (val) => {
          return(stringIsInteger(val))
        }, 
        { message: "Please enter a valid number." }
      ),
  }))
})
  .refine((formData) => {
    if (!formData.statGoal) return true
    const statGoal = parseInt(formData.statGoal)
    return !formData.petType || ( statGoal >= 0 && statGoal <= statRange[formData.petType as Pet]?.max )
  },
  (formData) => ({
    message: `Must be between 0 and ${statRange[formData.petType as Pet]?.max}.`,
    path: ["statGoal"],
  }))

const levelsStringToArray = (val: string) => {
  const levels: number[] = []
  for (const level of val) {
    if (!isNaN(parseInt(level))) {
      levels.push(parseInt(level))
    }
  }
  return levels
}

const stringToInteger = (val: string) => {
  return Number(val.replace(/,/g, ""))
}

const stringIsInteger = (val: string) => {
  return /^\d+$/.test(val.replace(/,/g, ""))
}

function PetInput({ setPetState }: {
  setPetState: (
    petType: Pet, 
    levels: number[], 
    exp: number,
    statGoal: number, 
    levelsGoal: number[],
    sacPrices: Record<SacTier, number>, 
    candyPrices: Record<RaiseTier, number>,
  ) => void;
}) {
  const [savePricesCount, setSavePricesCount] = useState<number>(0)
  const [saveButtonText, setSaveButtonText] = useState("Remember Prices")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues()
  })
  const { fields: sacPriceFields } = useFieldArray({
    control: form.control,
    name: "sacPrice",
  })
  const { fields: candyPriceFields } = useFieldArray({
    control: form.control,
    name: "candyPrice",
  })

  useEffect(() => {
    console.log(form.getValues())
    localStorage.setItem("sacPrice", JSON.stringify(form.getValues().sacPrice))
    localStorage.setItem("candyPrice", JSON.stringify(form.getValues().candyPrice))
    setTimeout(() => {
      setSaveButtonText("Remember Prices")
    }, 500)
  }, [savePricesCount, form])

  function savePrices() {
    setSavePricesCount(savePricesCount + 1)
    setSaveButtonText("Saved!")
  }

  function resetPrices() {
    form.reset({
      ...form.getValues(),
      sacPrice: defaultValues.sacPrice,
      candyPrice: defaultValues.candyPrice,
    })
  }

  function onSubmit(formData: z.infer<typeof formSchema>) {
    const levels = []
    for (const level of formData.levels) {
      if (!isNaN(parseInt(level))) {
        levels.push(parseInt(level))
      }
    }
    const statGoal = parseInt(formData.statGoal)
    const exp = parseFloat(formData.exp)
    const levelsGoal = levelsStringToArray(formData.levelsGoal)
    const sacPrices: Record<SacTier, number> = {} as Record<SacTier, number>
    for (const priceObject of formData.sacPrice) {
      sacPrices[priceObject.tier as SacTier] = stringToInteger(priceObject.price)
    }
    const candyPrices: Record<RaiseTier, number> = {} as Record<RaiseTier, number>
    for (const priceObject of formData.candyPrice) {
      candyPrices[priceObject.tier as RaiseTier] = stringToInteger(priceObject.price)
    }
    candyPrices["egg"] = candyPrices["f"]
    setPetState(
      formData.petType as Pet,
      levels,
      exp,
      statGoal,
      levelsGoal,
      sacPrices,
      candyPrices,
    )
  }

  const petType: Pet = form.watch("petType") as Pet
  const levels: string = form.watch("levels")
  const statGoal: string = form.watch("statGoal")
  const levelsGoal: string = form.watch("levelsGoal")

  const levelsArray = levelsStringToArray(levels)
  const tier = tiers[levelsArray.length]
  const tierString = levelsRegex.test(levels) ? tier[0].toUpperCase() + tier.slice(1) : "N/A"
  const statSuffix = statNameByPetType[petType] ? (statNameByPetType[petType]) : ""
  const currentStat = 
    petType && levelsArray.length > 0 && levelsRegex.test(levels) 
    ? statsTotal(levelsArray, petType) + statSuffix 
    : "N/A"
  const isSubmitDisabled = !statGoal && (!levelsGoal || levelsGoal.startsWith(" "))

  return(
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="m-2">
          <CardHeader>
            <CardTitle>Current Pet</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="petType"
              render={
                ({ field: { onChange } }) => (  
                  <FormItem>
                    <FormLabel>Pet Type</FormLabel>
                    <Select onValueChange={onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Pet Type"/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unicorn">Unicorn - HP</SelectItem>
                        <SelectItem value="dragon">Dragon - Attack</SelectItem>
                        <SelectItem value="griffin">Griffin - Defense</SelectItem>
                        <SelectItem value="angel">Angel - Critical Chance</SelectItem>
                        <SelectItem value="crab">Crab - Critical Damage</SelectItem>
                        <SelectItem value="tiger">Tiger - STR</SelectItem>
                        <SelectItem value="lion">Lion - STA</SelectItem>
                        <SelectItem value="rabbit">Rabbit - DEX</SelectItem>
                        <SelectItem value="fox">Fox - INT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>      
                )
              }
            />
            <div className="flex flex-row justify-center">
              <div className="flex-grow pr-1">
                <FormField
                  control={form.control}
                  name="levels"
                  render={
                    ({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Levels</FormLabel>
                        <FormControl>
                          <PatternFormat 
                            id="levels"
                            onChange={onChange}
                            value={value}
                            type="text"
                            inputMode="numeric"
                            allowEmptyFormatting
                            format="#/#/#/#/#/#/#"
                            customInput={Input}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }
                />
              </div>
              <div className="flex-grow pl-1">
                <FormField
                  control={form.control}
                  name="exp"
                  render={
                    ({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <FormControl>
                          <NumericFormat
                            onChange={onChange}
                            value={value}
                            type="text"
                            inputMode="numeric"
                            suffix={"%"}
                            customInput={Input}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }
                />
              </div>
            </div>
            <div className="flex flex-row text-sm">
              <div className="w-1/2 pl-1 font-medium">
                <p>Tier: {tierString}</p>
              </div>
              <div className="w-1/2 pl-1 font-medium">
                <p>Stat: {currentStat}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="m-2">
          <CardHeader>
            <CardTitle>Target Pet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row justify-center">
              <div className="flex-grow pr-1">
                <FormField
                  control={form.control}
                  name="levelsGoal"
                  render={
                    ({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Minimum Levels</FormLabel>
                        <FormControl>
                          <PatternFormat 
                            id="levelsGoal"
                            onChange={onChange}
                            value={value}
                            type="text"
                            inputMode="numeric"
                            allowEmptyFormatting
                            format="#/#/#/#/#/#/#"
                            customInput={Input}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }
                />
              </div>
              <div className="flex-grow pl-1">
                <FormField 
                  control={form.control}
                  name="statGoal"
                  render={
                    ({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Minimum Stat</FormLabel>
                        <FormControl>
                          <NumericFormat
                            onChange={onChange}
                            value={value}
                            type="text"
                            inputMode="numeric"
                            suffix={statSuffix}
                            customInput={Input}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }
                />
              </div>
            </div>
            <div className="text-center">
              <Button 
                type="submit" 
                disabled={isSubmitDisabled}
              >Calculate Cost</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="m-2">
          <CardHeader>
            <CardTitle>Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="flex-1 pr-4 border-r">
                <h3 className="font-medium text-primary">Sac Pet</h3>
                {
                  sacPriceFields.map((field, index: number) => {
                    return (              
                      <FormField
                        key={`sacPrice.${field.tier}`}
                        control={form.control}
                        name={`sacPrice.${index}.price`}
                        render={
                          ({ field: { onChange, value } }) => (
                            <FormItem>
                              <FormLabel className="capitalize">{field.tier}</FormLabel>
                              <FormControl>
                                <NumericFormat
                                  onChange={onChange}
                                  value={value}
                                  type="text"
                                  inputMode="numeric"
                                  thousandsGroupStyle="thousand"
                                  thousandSeparator=","
                                  customInput={Input}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        }
                      />
                    )
                  })
                }
              </div>
              <div className="flex-1 pl-4">
                <h3 className="font-medium text-primary">Pet Candy</h3>
                {
                  candyPriceFields.map((field, index: number) => {
                    return (              
                      <FormField
                        key={`candyPrice.${field.tier}`}
                        control={form.control}
                        name={`candyPrice.${index}.price`}
                        render={
                          ({ field: { onChange, value }}) => (
                            <FormItem>
                              <FormLabel className="capitalize">{field.tier}</FormLabel>
                              <FormControl>
                                <NumericFormat 
                                  onChange={onChange}
                                  value={value}
                                  type="text"
                                  inputMode="numeric"
                                  thousandsGroupStyle="thousand"
                                  thousandSeparator=","
                                  customInput={Input}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        }
                      />
                    )
                  })
                }
              </div>
            </div>
            <div className="flex flex-row justify-center">
              <div className="text-center mx-1">
                <Button className="w-32" type="button" onClick={savePrices}>{saveButtonText}</Button>
              </div>
              <div className="text-center mx-1">
                <Button className="w-32" type="button" onClick={resetPrices}>Default Prices</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}

export { PetInput }