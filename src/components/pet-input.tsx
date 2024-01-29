import { useForm, useFieldArray } from "react-hook-form"

export default function PetInput({ setPetState }: {
  setPetState: (
    petType: string, 
    levels: number[], 
    statGoal: number, 
    sacPrices: {[key: string]: number}, 
    candyPrices: {[key: string]: number}
  ) => void;
}) {
  type FormValues = {
    petType: string,
    levels: string,
    statGoal: {
      type: string,
      goal: string,
    }[],
    sacPrice: {
      tier: string,
      price: string,
    }[],
    candyPrice: {
      tier: string,
      price: string,
    }[],
  }

  const defaultValues : FormValues = {
    petType: "unicorn",
    levels: "1",
    statGoal: [
      { type: "unicorn", goal: "7162" },
      { type: "dragon", goal: "500" },
      { type: "griffin", goal: "450" },
      { type: "angel", goal: "31" },
      { type: "crab", goal: "45" },
      { type: "tiger", goal: "75" },
      { type: "lion", goal: "75" },
      { type: "rabbit", goal: "75" },
      { type: "fox", goal: "75" },
    ],
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

  const { control, register, watch, handleSubmit, formState: {errors} } = useForm({
    defaultValues: defaultValues
  })
  const { fields: statGoalFields } = useFieldArray({
    control,
    name: "statGoal",
  })
  const { fields: sacPriceFields } = useFieldArray({
    control,
    name: "sacPrice",
  })
  const { fields: candyPriceFields } = useFieldArray({
    control,
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
    const statGoal = parseInt(
      (
        formData.statGoal.find((statGoalObject) => {
          return statGoalObject.type === formData.petType
        }) as {type: string, goal: string}
      ).goal
    )
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
            {
              statGoalFields.map((field, index: number) => {
                return (
                  petType === field.type &&
                  <input key={field.type}
                    {...register(
                      `statGoal.${index}.goal`,
                      {
                        required: true,
                        min: 0,
                        max: defaultValues.statGoal[index].goal
                      }
                    )}
                    type="number"
                  ></input>
                )
              })
            }
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