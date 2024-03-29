import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Number formatting
const numberFormat = new Intl.NumberFormat("en-us")
const formatThousands = (inputValue: number) => numberFormat.format(Math.round(inputValue))

// Table of probabilities for pet sacrificing
const p: Record<Tier, Partial<Record<Tier, number[]>>> = {
  "egg": {
    "egg": [],
  },
  "f": {
      "f": [1],
  },
  "e": {
      "e": [0.7, 0.3],
      "d": [0.6, 0.4],
      "c": [0.5, 0.5],
      "b": [0.4, 0.6],
      "a": [0.3, 0.7],
      "s": [0.2, 0.8],
  },
  "d": {
      "d": [0.57, 0.25, 0.18],
      "c": [0.35, 0.47, 0.18],
      "b": [0.25, 0.50, 0.25],
      "a": [0.23, 0.45, 0.32],
      "s": [0.20, 0.35, 0.45],
  },
  "c": {
      "c": [0.45, 0.31, 0.18, 0.06],
      "b": [0.31, 0.45, 0.18, 0.06],
      "a": [0.18, 0.28, 0.45, 0.09],
      "s": [0.15, 0.27, 0.43, 0.15],
  },
  "b": {
      "b": [0.40, 0.28, 0.18, 0.10, 0.04],
      "a": [0.28, 0.35, 0.18, 0.13, 0.06],
      "s": [0.18, 0.25, 0.33, 0.15, 0.09],
  },
  "a": {
      "a": [0.35, 0.23, 0.17, 0.12, 0.07, 0.04, 0.02],
      "s": [0.11, 0.15, 0.26, 0.25, 0.14, 0.06, 0.03],
  },
  "s": {
      "s": [0.27, 0.21, 0.17, 0.13, 0.09, 0.06, 0.04, 0.02, 0.01],
  }
}

const tiers: Tier[] = ["egg", "f", "e", "d", "c", "b", "a", "s"]

const candyPerTier: Record<RaiseTier, number> = {
  "egg": 10,
  "f": 20,
  "e": 20,
  "d": 25,
  "c": 25,
  "b": 25,
  "a": 50,
}

const levelsPerTier: Record<Tier, number> = {
  "egg": 1,
  "f": 1,
  "e": 2,
  "d": 3,
  "c": 4,
  "b": 5,
  "a": 7,
  "s": 9,
}

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

// Array of pet level states. Sorted into arrays by depth so our algorithm is fast.
const statesByDepth: number[][][] = []
let nextDepth: number[][] = [[]]
do {
  statesByDepth.push([...nextDepth])
  const thisDepth = nextDepth
  nextDepth = []
  for (const state of thisDepth) {
    const tier = tiers[state.length]
    if (tier !== "egg" && state.slice(-1)[0] !== levelsPerTier[tier]) {
      const newState = [...state]
      newState[newState.length-1] = state.slice(-1)[0] + 1
      nextDepth.push(newState)
    }
    if (tier !== "s") {
      const newState = [...state]
      newState.push(1)
      nextDepth.push(newState)
    }
  }
} while (nextDepth.length > 0)

// Possible actions in a given state. Sac pets are "e" through "s", raising is "up"
function actions(state: number[]): string[] {
  const tier = tiers[state.length]
  const result: string[] = []
  if (tier !== "s") result.push("up")
  if (
    tier !== "egg" &&
    tier !== "f" && 
    state.slice(-1)[0] < levelsPerTier[tier]
  ) {
    for (const sac in p[tier]) {
      result.push(sac)
    }
  }
  return result
}

// Total stats of a state
function statsTotal(state: number[], petType: Pet): number {
  let sum = 0
  for (const level of state) {
    sum += statsByPetType[petType][level-1]
  }
  return sum
}

// Does the state reach the level and stat goal?
function isGoodEnd(state: number[], petType: Pet, levelsGoal: number[], statGoal: number): boolean {
  if (levelsGoal) {
    if (levelsGoal.length > state.length) {
      return false
    }
    for (const [index, level] of levelsGoal.entries()) {
      if (state[index] < level) {
        return false
      }
    }
  }
  if (!statGoal) return true
  else return statsTotal(state, petType) >= statGoal!
}

// Is it impossible to reach the level and stat goal from this state?
function isBadEnd(state: number[], petType: Pet, levelsGoal: number[], statGoal: number): boolean {
  for (const [index, level] of state.entries()) {
    if (index < state.length-1 && levelsGoal && level < levelsGoal[index]) {
      return true
    }
  }
  return (
    tiers[state.length] == "s" &&
    state.slice(-1)[0] == 9 &&
    statsTotal(state, petType) < statGoal
  )
}

// Data structure that stores counts of each type of action
class ActionCount { 
  sac: Record<SacTier, number> = {
    "e": 0,
    "d": 0,
    "c": 0,
    "b": 0,
    "a": 0,
    "s": 0,
  }
  up: Record<RaiseTier, number> = {
    "egg": 0,
    "f": 0,
    "e": 0,
    "d": 0,
    "c": 0,
    "b": 0,
    "a": 0,
  }

  // Add another action count, multiplied by a scaling factor, to this action count
  addFactor(other: ActionCount, factor: number) {
    for (const tier in other.sac) {
      this.sac[tier as SacTier] += other.sac[tier as SacTier] * factor
    }
    for (const tier in other.up) {
      this.up[tier as RaiseTier] += other.up[tier as RaiseTier] * factor
    }
  }
}

type Results = {
  [key: string]: {
    action: string,
    actionCount: ActionCount
  }[]
}

// Flyweight action counts for good and bad ends
const goodEndActionCount = new ActionCount()
const badEndActionCount = new ActionCount()
for (const tier in badEndActionCount.sac) {
  badEndActionCount.sac[tier as SacTier] = Infinity
}
for (const tier in badEndActionCount.up) {
  badEndActionCount.up[tier as RaiseTier] = Infinity
}

// Calculates expected candy cost from action count
function candyCostFromActionCount(actionCount: ActionCount, costUp: Record<RaiseTier, number>) {
  let cost = 0
  for (const tier in actionCount.up) {
    cost += actionCount.up[tier as RaiseTier] * costUp[tier as RaiseTier]
  }
  return cost
}

// Calculates expected sac pet cost from action count
function sacCostFromActionCount(actionCount: ActionCount, costSac: Record<SacTier, number>) {
  let cost = 0
  for (const tier in actionCount.sac) {
    cost += actionCount.sac[tier as SacTier] * costSac[tier as SacTier]
  }
  return cost
}

// Calculates total expected cost from action count
function costFromActionCount(
  actionCount: ActionCount,
  costUp: Record<RaiseTier, number>, 
  costSac: Record<SacTier, number>
) {
  let cost = 0
  cost += candyCostFromActionCount(actionCount, costUp)
  cost += sacCostFromActionCount(actionCount, costSac)
  return cost
}

// All the cost calculation
function calculatePetCost(
  petType: Pet, 
  levelsGoal: number[], 
  statGoal: number, 
  costUp: Record<RaiseTier, number>, 
  costSac: Record<SacTier, number>
) {
  const stateActionCounts: Results = {}
  
  function calculateActionCount(state: number[], action: string): ActionCount {
    const result = new ActionCount()
    const tier = tiers[state.length]
    if (action === "up") {
      const upTier = tiers[state.length+1]
      for (const [index, pSucc] of p[upTier]![upTier]!.entries()) {
        const succState: number[] = [...state]
        succState.push(index + 1)
        const succActionCount: ActionCount = stateActionCounts[JSON.stringify(succState)][0].actionCount
        if (succActionCount === badEndActionCount) {
          return badEndActionCount
        }
        result.addFactor(succActionCount, pSucc)
      }
      result.up[tier as RaiseTier] += 1
    }
    else {
      let pSelf = 0
      p[tier][action as SacTier]?.slice(0, state.slice(-1)[0]).forEach((pSelfPart) => pSelf += pSelfPart)
      p[tier][action as SacTier]?.slice(state.slice(-1)[0]).forEach((pSucc, index) => {
        const succState: number[] = [...state]
        succState[succState.length - 1] = index + state.slice(-1)[0] + 1
        result.addFactor(stateActionCounts[JSON.stringify(succState)][0].actionCount, pSucc/(1-pSelf))
      })
      result.sac[action as SacTier] += 1/(1-pSelf)
    }
    return result
  }

  for (let depth: number = statesByDepth.length-1; depth >= 0; depth--) {
    for (const state of statesByDepth[depth]) {
      if (isGoodEnd(state, petType, levelsGoal, statGoal)) {
        stateActionCounts[JSON.stringify(state)] = [{
          action: "good",
          actionCount: goodEndActionCount
        }]
      }
      else if (isBadEnd(state, petType, levelsGoal, statGoal)) {
        stateActionCounts[JSON.stringify(state)] = [{
          action: "bad",
          actionCount: badEndActionCount
        }]
      }
      else {
        const newStateActionCounts = []
        for (const action of actions(state)) {
          newStateActionCounts.push({
            action: action,
            actionCount: calculateActionCount(state, action)
          })
        }
        newStateActionCounts.sort((a, b) => {
          if (
            isNaN(costFromActionCount(b.actionCount, costUp, costSac)) || 
            costFromActionCount(a.actionCount, costUp, costSac) < 
              costFromActionCount(b.actionCount, costUp, costSac)
          ) {
            return -1
          }
          else {
            return 0
          }
        })
        stateActionCounts[JSON.stringify(state)] = newStateActionCounts
      }
    }
  }

  return stateActionCounts
}

// Get UI string for action
function actionString(action: string, state: number[]): string {
  if (action === "up") {
    return `Raise to ${tiers[state.length+1].toUpperCase()}`
  }
  else {
    return `Sacrifice ${action.toUpperCase()} Pet`
  }
}

export default function PetResults({ petType, levels, exp, statGoal, levelsGoal, sacPrices, candyPrices }: {
  petType: Pet;
  levels: number[];
  exp: number;
  statGoal: number;
  levelsGoal: number[];
  sacPrices: Record<SacTier, number>;
  candyPrices: Record<RaiseTier, number>;
}) {
  if (!petType) {
    return (
      <div>
        <Card className="m-2">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-8 mb-12">
              <i className="text-gray-500">Please complete Pet Info to see results.</i>
            </div>
          </CardContent>
        </Card>
        <Card className="m-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-8 mb-12">
              <i className="text-gray-500">Please complete Pet Info to see results.</i>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate raise cost from candy cost and exp
  const costUp: Record<RaiseTier, number> = {} as Record<RaiseTier, number>
  Object.keys(candyPrices).forEach((tier) => {
    if (tier === tiers[levels.length]) {
      costUp[tier as RaiseTier] = Math.round( candyPerTier[tier as RaiseTier] * (1-(( exp ? exp : 0 )/100)) ) * candyPrices[tier as RaiseTier]
    }
    else {
      costUp[tier as RaiseTier] = candyPerTier[tier as RaiseTier] * candyPrices[tier as RaiseTier]
    }
  })

  // Cost of sac pet by tier
  const costSac = sacPrices

  // Calculate results
  const results = calculatePetCost(petType, levelsGoal, statGoal, costUp, costSac)

  // State string
  const currentState = JSON.stringify(levels)
  const currentResult = results[currentState]

  // Are we at an "end" state?
  if (currentResult[0].action === "good") {
    return(
      <div></div>
    )
  }
  if (currentResult[0].action === "bad") {
    return(
      <div></div>
    )
  }
  
  // Generate table entries for actions table
  const actionsTableEntries: Record<"action" | "cost", string>[] = []
  results[currentState].forEach(({action, actionCount}) => {
    const costNumber = costFromActionCount(actionCount, costUp, costSac)
    const tableEntry = {
      action: actionString(action, levels),
      cost: isFinite(costNumber) ? formatThousands(costNumber) : "Goal Impossible",
    }
    actionsTableEntries.push(tableEntry)
  })

  return (
    <div>
      <Card className="m-2">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="mb-4">    
              <div>Average Total Cost: { formatThousands(costFromActionCount(currentResult[0].actionCount, costUp, costSac)) }</div>
              <div>Best Action: { actionString(currentResult[0].action, levels) }</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Average Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionsTableEntries.map((tableEntry) => (
                  <TableRow key={tableEntry.action}>
                    <TableCell className="text-left">{tableEntry.action}</TableCell>
                    <TableCell className="text-right">{tableEntry.cost}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card className="m-2">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Action</Label>
          <Select>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {
                results[currentState].map(({ action }) => {
                  return(
                    <SelectItem value="action">{ actionString(action, levels) }</SelectItem>
                  )
                })
              }
            </SelectContent>
          </Select>
          <div className="flex flex-row m-2">
            <div>
              <h3>Sac Pet Cost: { formatThousands(sacCostFromActionCount(currentResult[0].actionCount, costSac)) }</h3>
              {
                Object.keys(currentResult[0].actionCount.sac).map((tier) => {
                  return(
                    currentResult[0].actionCount.sac[tier as SacTier] > 0 && 
                    <div key={"sac" + tier}>
                      {tier}: { formatThousands(currentResult[0].actionCount.sac[tier as SacTier] * costSac[tier as SacTier]) }
                    </div>
                  )
                })
              }
            </div>
            <div>
              <h3>Pet Candy Cost: { formatThousands(candyCostFromActionCount(currentResult[0].actionCount, costUp)) }</h3>
              {
                Object.keys(currentResult[0].actionCount.up).map((tier) => {
                  return(
                    currentResult[0].actionCount.up[tier as RaiseTier] > 0 && 
                    <div>
                      {tier}: { formatThousands(currentResult[0].actionCount.up[tier as RaiseTier] * costUp[tier as RaiseTier]) }
                    </div>
                  )
                })
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}