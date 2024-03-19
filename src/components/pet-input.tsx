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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const formSchema = z.object({
  petType: z.string()
    .min(1, "Field is required."),
  levels: z.string()
    .regex(
      /^(?!\s).+/,
      "Field is required."
    )
    .regex(
      /^(1| )\/([1-2]| )\/([1-3]| )\/([1-4]| )\/([1-5]| )\/([1-7]| )\/([1-9]| )$/,
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
  levelsGoal: z.string(),
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

const statRange: Record<Pet, { min: number, max: number }> = {
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
    exp: number,
    statGoal: number, 
    levelsGoal: number[],
    sacPrices: {[key: string]: number}, 
    candyPrices: {[key: string]: number}
  ) => void;
}) {
  const statNameByPetType: Record<Pet, string> = {
    "unicorn": "HP",
    "dragon": "Attack",
    "griffin": "Defense",
    "angel": "% Critical Chance",
    "crab": "% Critical Damage",
    "tiger": "STR",
    "lion": "STA",
    "rabbit": "DEX",
    "fox": "INT",
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
  })
  const { fields: sacPriceFields } = useFieldArray({
    control: form.control,
    name: "sacPrice",
  })
  const { fields: candyPriceFields } = useFieldArray({
    control: form.control,
    name: "candyPrice",
  })

  function onSubmit(formData: z.infer<typeof formSchema>) {
    console.log(formData)
    const levels = []
    for (const level of formData.levels) {
      if (!isNaN(parseInt(level))) {
        levels.push(parseInt(level))
      }
    }
    const statGoal = parseInt(formData.statGoal)
    const exp = parseFloat(formData.exp)
    const levelsGoal = levelsStringToArray(formData.levelsGoal)
    const sacPrices: {[key: string]: number} = {}
    for (const priceObject of formData.sacPrice) {
      sacPrices[priceObject.tier] = stringToInteger(priceObject.price)
    }
    const candyPrices: {[key: string]: number} = {}
    for (const priceObject of formData.candyPrice) {
      candyPrices[priceObject.tier] = stringToInteger(priceObject.price)
    }
    setPetState(
      formData.petType,
      levels,
      exp,
      statGoal,
      levelsGoal,
      sacPrices,
      candyPrices,
    )
  }

  const petType: Pet = form.watch("petType") as Pet
  const statGoal: string = form.watch("statGoal")
  const levelsGoal: string = form.watch("levelsGoal")

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
            <div className="flex flex-row">
              <div className="pr-1">
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
              <div className="pl-1">
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
          </CardContent>
        </Card>
        <Card className="m-2">
          <CardHeader>
            <CardTitle>Target Pet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row">
              <div className="pr-1">
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
              <div className="pl-1">
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
                            suffix={statNameByPetType[petType] ? (" " + statNameByPetType[petType]) : ""}
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
            <Button type="submit" disabled={!statGoal && (!levelsGoal || levelsGoal.startsWith(" "))}>Calculate</Button>
          </CardContent>
        </Card>
        <Card className="m-2">
          <CardHeader>
            <CardTitle>Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="flex-1 pr-1">
                <h3>Sac Pet</h3>
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
              <div className="flex-1 pl-1">
                <h3>Pet Candy</h3>
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
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}

export { PetInput }