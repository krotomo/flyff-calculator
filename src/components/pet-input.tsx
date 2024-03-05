import { useForm, useFieldArray, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  petType: z.string(),
  levels: z.string(),
  statGoal: z.string(),
  sacPrice: z.array(z.object({
    tier: z.string(),
    price: z.string(),
  })),
  candyPrice: z.array(z.object({
    tier: z.string(),
    price: z.string(),
  }))
})

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petType: "",
      levels: "",
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
  })
  const { fields: sacPriceFields } = useFieldArray({
    control: form.control,
    name: "sacPrice",
  })
  const { fields: candyPriceFields } = useFieldArray({
    control: form.control,
    name: "candyPrice",
  })

  const petType = form.watch("petType")

  function onSubmit(formData: z.infer<typeof formSchema>) {
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <h2>Pet Info</h2>
          <div>
            <FormField
              control={form.control}
              name="petType"
              render={
                ({ field }) => (  
                  <FormItem>
                    <FormLabel>Pet Type</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Pet Type"/>
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>      
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="levels">Levels</Label>
            <Controller
              control={form.control}
              name="levels"
              render={
                ({ field: { onChange, value } }) => (            
                  <PatternFormat 
                    id="levels"
                    onChange={onChange}
                    value={value}
                    type="text"
                    allowEmptyFormatting
                    format="#/#/#/#/#/#/#"
                    customInput={Input}
                  />
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="statGoal">Stat Goal</Label>
            <Input
              id="statGoal"
              {...form.register(
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
                  <div key={`sacPrice.${field.tier}`}>
                    <Label 
                      className="capitalize"
                      htmlFor={`sacPrice.${field.tier}`}
                    >{field.tier}</Label>
                    <Controller
                      control={form.control}
                      name={`sacPrice.${index}.price`}
                      rules={{
                        required: true,
                        min: 0,
                      }}
                      render={
                        ({ field: { onChange, value } }) => (
                          <NumericFormat
                            id={`sacPrice.${field.tier}`}
                            onChange={onChange}
                            value={value}
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
                  <div key={`candyPrice.${field.tier}`}>
                    <Label 
                      className="capitalize"
                      htmlFor={`candyPrice.${field.tier}`}
                    >{field.tier}</Label>
                    <Controller 
                      control={form.control}
                      name={`candyPrice.${index}.price`}
                      rules={{
                        required: true,
                        min: 0,
                      }}
                      render={
                        ({ field: { onChange, value } }) => (
                          <NumericFormat
                            id={`candyPrice.${field.tier}`}
                            onChange={onChange}
                            value={value}
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
      </Form>
    </div>
  )
}

export { PetInput }