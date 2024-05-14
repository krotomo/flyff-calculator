import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
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

const statNameByPetTypeShort: Record<Pet, string> = {
  "unicorn": " HP",
  "dragon": " Attack",
  "griffin": " DEF",
  "angel": "% CC",
  "crab": "% CD",
  "tiger": " STR",
  "lion": " STA",
  "rabbit": " DEX",
  "fox": " INT",
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
  if (result.length === 0) result.push("none")
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

type Result = {
  action: string,
  actionCount: ActionCount
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

function candyToRaise(state: number[], exp: number) {
  const result = Object.assign({}, candyPerTier)
  const tier = tiers[state.length]
  result[tier as RaiseTier] = Math.round(candyPerTier[tier as RaiseTier] * (1-(( exp ? exp : 0 )/100)))
  return result
}

function costToRaise(state: number[], exp: number, candyPrices: Record<RaiseTier, number>) {
  const result = {} as Record<RaiseTier, number>
  const candyCount = candyToRaise(state, exp)
  for (const tier in candyPrices) {
    result[tier as RaiseTier] = candyCount[tier as RaiseTier] * candyPrices[tier as RaiseTier]
  }
  return result
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

// Get successor states and probabilities given an action and state
function successorsFromAction(
  state: number[],
  action: string,
) {
  const successors = {} as Record<string, number>
  if (state.length < 7 && action === "up") {
    const upTier = tiers[state.length + 1]
    for (const [index, pSucc] of p[upTier]![upTier]!.entries()) {
      const succState = [...state]
      succState.push(index + 1)
      successors[JSON.stringify(succState)] = pSucc
    }
  }
  else {
    const tier = tiers[state.length]
    let pSelf = 0
    p[tier][action as SacTier]?.slice(0, state.slice(-1)[0]).forEach((pSelfPart) => pSelf += pSelfPart)
    p[tier][action as SacTier]?.slice(state.slice(-1)[0]).forEach((pSucc, index) => {
      const succState: number[] = [...state]
      succState[succState.length - 1] = index + state.slice(-1)[0] + 1
      successors[JSON.stringify(succState)] = pSucc
    })
    successors[JSON.stringify(state)] = pSelf
  }
  return successors
}

// All the cost calculation
function calculatePetCost(
  petType: Pet, 
  levelsGoal: number[], 
  statGoal: number, 
  costUp: Record<RaiseTier, number>, 
  costSac: Record<SacTier, number>
) {
  const stateActionCounts: Record<string, Result[]> = {}
  
  function calculateActionCount(state: number[], action: string): ActionCount {
    const result = new ActionCount()
    const tier = tiers[state.length]
    const successors = successorsFromAction(state, action)
    if (action === "up") {
      for (const [ succState, succProb ] of Object.entries(successors)) {
        const succActionCount: ActionCount = stateActionCounts[succState][0].actionCount
        if (succActionCount === badEndActionCount) {
          return badEndActionCount
        }
        result.addFactor(succActionCount, succProb)
      }
      result.up[tier as RaiseTier] += 1
    }
    else {
      const selfState = JSON.stringify(state)
      const selfProb = successors[selfState]
      result.sac[action as SacTier] += 1/(1-selfProb)
      for (const [ succState, succProb ] of Object.entries(successors)) {
        if (succState !== selfState) {
          if (stateActionCounts[succState][0].actionCount === badEndActionCount) {
            return badEndActionCount
          }
          result.addFactor(stateActionCounts[succState][0].actionCount, succProb/(1-selfProb))
        }
      }
    }
    return result
  }

  for (let depth: number = statesByDepth.length-1; depth >= 0; depth--) {
    for (const state of statesByDepth[depth]) {
      if (isGoodEnd(state, petType, levelsGoal, statGoal)) {
        stateActionCounts[JSON.stringify(state)] = actions(state).map((action) => ({
          action: action,
          actionCount: goodEndActionCount
        }))
      }
      else if (isBadEnd(state, petType, levelsGoal, statGoal)) {
        stateActionCounts[JSON.stringify(state)] = actions(state).map((action) => ({
          action: action,
          actionCount: badEndActionCount
        }))
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
  else if (action === "none") {
    return "No Action"
  }
  else {
    return `Sacrifice ${action.toUpperCase()} Pet`
  }
}

function GoodEndTable({ petType, levels, levelsGoal, statGoal }: {
  petType: Pet
  levels: number[]
  levelsGoal: number[]
  statGoal: number
}) {
  // current pet
  const currentLevelsString = levels.join("/")
  const currentStatString = statsTotal(levels, petType) + statNameByPetTypeShort[petType]

  // target pet
  const targetLevelsString = levelsGoal.length ? levelsGoal.join("/") : "N/A"
  const targetStatString = statGoal ? statGoal + statNameByPetTypeShort[petType] : "N/A"

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Levels</TableHead>
            <TableHead className="text-right">Stat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead>Target Pet</TableHead>
            <TableCell>{ targetLevelsString }</TableCell>
            <TableCell className="text-right">{ targetStatString }</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Current Pet</TableHead>
            <TableCell className="text-green-600">{ currentLevelsString }</TableCell>
            <TableCell className="text-right text-green-600">{ currentStatString }</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

function BadEndTable({ petType, levels, levelsGoal, statGoal }: {
  petType: Pet
  levels: number[]
  levelsGoal: number[]
  statGoal: number
}) {
  // target pet
  const targetLevelsString = levelsGoal.length ? levelsGoal.join("/") : "N/A"
  const targetStatString = statGoal ? statGoal + statNameByPetTypeShort[petType] : "N/A"

  // best pet
  const perfectLevels = [1, 2, 3, 4, 5, 7, 9]
  const bestLevels = levels.slice(0, levels.length-1).concat(perfectLevels.slice(levels.length-1))
  const bestLevelsString = bestLevels.join("/")
  const bestStat = statsTotal(bestLevels, petType)
  const bestStatString = bestStat + statNameByPetTypeShort[petType]

  // goals
  const statGoalMet = statGoal ? bestStat >= statGoal : true
  const levelsGoalMet = levelsGoal.reduce((acc, val, index) => {
    return acc && bestLevels[index] >= val
  }, true)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Levels</TableHead>
            <TableHead className="text-right">Stat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead>Target Pet</TableHead>
            <TableCell>{ targetLevelsString }</TableCell>
            <TableCell className="text-right">{ targetStatString }</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Best Possible Pet</TableHead>
            <TableCell className={levelsGoalMet ? "" : "text-destructive"}>{ bestLevelsString }</TableCell>
            <TableCell className={statGoalMet ? "text-right" : "text-right text-destructive"}>{ bestStatString }</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

function CostTable({ selectedActionCount, levels, exp, costUp, costSac }: {
  selectedActionCount: ActionCount,
  levels: number[],
  exp: number,
  costUp: Record<RaiseTier, number>
  costSac: Record<SacTier, number>
}) {
  // Cost details
  const totalCost = formatThousands(costFromActionCount(selectedActionCount, costUp, costSac))

  // Sac Cost
  const sacCostTableEntries: Record<"action" | "count" | "cost", string>[] = []
  const sacCost = formatThousands(sacCostFromActionCount(selectedActionCount, costSac))
  for (const tier in selectedActionCount.sac) {
    const count = selectedActionCount.sac[tier as SacTier]
    if (count > 0) {
      const tableEntry = {
        action: tier.toUpperCase(),
        count: numberFormat.format(Math.round(count * 10) / 10),
        cost: formatThousands(count * costSac[tier as SacTier])
      }
      sacCostTableEntries.push(tableEntry)
    }
  }

  // Candy Cost
  const candyCostTableEntries: Record<"action" | "candy" | "count" | "cost", string>[] = []
  const candyCost = formatThousands(candyCostFromActionCount(selectedActionCount, costUp))
  const candyCount = candyToRaise(levels, exp)
  for (const tier in selectedActionCount.up) {
    const raiseCount = selectedActionCount.up[tier as RaiseTier]
    const candyCountAverage = raiseCount * candyCount[tier as RaiseTier]
    if (raiseCount > 0) {
      const nextTier = tiers[tiers.indexOf(tier as Tier) + 1]
      const tierString = tier[0].toUpperCase() + tier.slice(1)
      const nextTierString = nextTier.toUpperCase()
      const tableEntry = {
        action: `${tierString} to ${nextTierString}`,
        candy: tier === "egg" ? "F" : tier.toUpperCase(),
        count: numberFormat.format(Math.round(candyCountAverage * 10) / 10),
        cost: formatThousands(raiseCount * costUp[tier as RaiseTier])
      }
      candyCostTableEntries.push(tableEntry)
    }
  }
  
  return (
    <div>
      <Table className="mb-2">
        <TableHeader>
          <TableRow>
            <TableHead>Sac Pet Cost</TableHead>
          </TableRow>
          <TableRow>
            <TableHead>Sac Tier</TableHead>
            <TableHead className="text-right">Count</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sacCostTableEntries.map(({action, count, cost}) => (
            <TableRow key={"sacCost" + action}>
              <TableCell className="text-left">{action}</TableCell>
              <TableCell className="text-right">{count}</TableCell>
              <TableCell className="text-right">{cost}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="text-left">Total (Sac Pet)</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right">{sacCost}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table className="mb-2">
        <TableHeader>
          <TableRow>
            <TableHead>Pet Candy Cost</TableHead>
          </TableRow>
          <TableRow>
            <TableHead>Raise Tier</TableHead>
            <TableHead>Candy</TableHead>
            <TableHead className="text-right">Count</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candyCostTableEntries.map(({action, candy, count, cost}) => (
            <TableRow key={"candyCost" + action}>
              <TableCell className="text-left">{action}</TableCell>
              <TableCell className="text-left">{candy}</TableCell>
              <TableCell className="text-right">{count}</TableCell>
              <TableCell className="text-right">{cost}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="text-left">Total (Pet Candy)</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right">{candyCost}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Table>
        <TableBody>
          <TableRow className="font-medium text-primary">
            <TableCell className="text-left">Total Cost</TableCell>
            <TableCell className="text-right">{totalCost}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

function ActionResults({ results, petType, levels, exp, levelsGoal, statGoal, costUp, costSac }: {
  results: Record<string, Result[]>
  petType: Pet
  levels: number[]
  exp: number
  levelsGoal: number[]
  statGoal: number
  candyPrices: Record<RaiseTier, number>
  costUp: Record<RaiseTier, number>
  costSac: Record<SacTier, number>
}) {
  // currentState and currentResult
  const currentState = JSON.stringify(levels)
  const currentResult = results[currentState]
  const goodResult = currentResult[0].actionCount === goodEndActionCount
  const badResult = currentResult[0].actionCount === badEndActionCount

  // Selected action
  const [selectedAction, setSelectedAction] = useState<string>(currentResult[0].action)

  // Update selected action when results change
  useEffect(() => {
    setSelectedAction(currentResult[0].action)
  }, [currentResult])

  // Summary info
  const bestCost = formatThousands(costFromActionCount(currentResult[0].actionCount, costUp, costSac))
  const bestAction = actionString(currentResult[0].action, levels)

  // Generate table entries for actions table
  const actionsTableEntries: Record<"action" | "actionCost" | "totalCost", string>[] = []
  const tier = tiers[levels.length]
  currentResult.forEach(({action, actionCount}) => {
    const actionCost = 
      action === "up" ? formatThousands(costUp[tier as RaiseTier]) : 
      action === "none" ? "N/A" :
      formatThousands(costSac[action as SacTier])
    const totalCostNumber = costFromActionCount(actionCount, costUp, costSac)
    const totalCostString = 
      !isFinite(totalCostNumber) ? "Goal Impossible"
      : totalCostNumber === 0 ? "Goal Reached"
      : formatThousands(totalCostNumber)
    const tableEntry = {
      action: actionString(action, levels),
      actionCost: actionCost,
      totalCost: totalCostString,
    }
    actionsTableEntries.push(tableEntry)
  })

  // Selected Action Count
  const selectedActionCount = currentResult.find((val) => { return val.action === selectedAction })?.actionCount 
    || currentResult[0].actionCount

  // Probabilities
  const successors = successorsFromAction(levels, selectedAction)
  const successorStates = Object.keys(successors)
  successorStates.sort((a, b) => {
    if (a.length !== b.length) return (a.length - b.length)
    const aArr = JSON.parse(a) as number[]
    const bArr = JSON.parse(b) as number[]
    const length = aArr.length
    return aArr[length-1] - bArr[length-1]
  })
  const successorTableEntries: Record<"state" | "stat" | "cost" | "prob", string>[] = []
  for (const succState of successorStates) {
    const state = JSON.parse(succState) as number[]
    const succActionCount = 
      succState === currentState 
      ? ( results[succState].find((val) => (val.action === selectedAction)) || results[succState][0] ).actionCount
      : results[succState][0].actionCount
    const costNumber = costFromActionCount(succActionCount, costUp, costSac)
    const costString = 
      !isFinite(costNumber) ? "Goal Impossible" :
      costNumber === 0 ? "Goal Reached" : 
      formatThousands(costNumber)
    const percent = Math.round(successors[succState] * 100)
    const tableEntry = {
      state: state.join("/"),
      stat: statsTotal(state, petType) + statNameByPetTypeShort[petType],
      cost: costString,
      prob: percent > 0 ? percent + "%" : "N/A",
    }
    successorTableEntries.push(tableEntry)
  }

  return (
    <div>
      <Card className="m-2">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            {
              goodResult ? (
                <div>
                  <h3 className="font-medium text-primary text-center mb-2">Goal Reached!</h3>
                  <p className="text-primary text-center mb-2">
                    <i className="opacity-60">Current pet meets all target goals. No action needed.</i>
                  </p>
                </div>
              )
              : badResult ? (
                <div>
                  <h3 className="font-medium text-primary text-center mb-2">Goal Impossible</h3>
                  <p className="text-primary text-center mb-2">
                    <i className="opacity-60">Target cannot be reached with current pet.</i>
                  </p>
                </div>
              )  
              : (
                <div className="flex justify-center mb-2 font-medium text-primary">
                  <table>
                    <tbody>
                      <tr>
                        <td className="text-left pr-6">Best Average Cost:</td>
                        <td className="text-right">{ bestCost }</td>
                      </tr>
                      <tr>
                        <td className="text-left">Best Action:</td>
                        <td className="text-right">{ bestAction }</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </CardContent>
      </Card>
      <Card className="m-2">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Action Cost</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionsTableEntries.map(({action, actionCost, totalCost}) => (
                  <TableRow key={action}>
                    <TableCell className="text-left">{action}</TableCell>
                    <TableCell className="text-right">{actionCost}</TableCell>
                    <TableCell className="text-right">{totalCost}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card className="m-2">
        <CardHeader>
          <CardTitle>Cost Details</CardTitle>
        </CardHeader>
        <CardContent>
          { !goodResult && (
            <div>
              <Label htmlFor="actionSelect">Action</Label>
              <Select value={selectedAction} onValueChange={(e) => setSelectedAction(e)}>
                <SelectTrigger id="actionSelect" className="mb-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {
                    currentResult.map(({ action }, index) => {
                      return (
                        <SelectItem key={"good" + action} value={action}>
                          {
                            !goodResult && !badResult && index === 0 ? actionString(action, levels) + " (Best)" 
                            : actionString(action, levels)
                          }
                        </SelectItem>
                      )
                    })
                  }
                </SelectContent>
              </Select>
            </div>
          )}
          { goodResult ? (
            <div>
              <h3 className="font-medium text-primary text-center mb-2">Goal Reached!</h3>
              <p className="text-primary text-center mb-2">
                <i className="opacity-60">Current pet meets level and/or stat requirements.</i>
              </p>
              <GoodEndTable
                petType={petType}
                levels={levels}
                levelsGoal={levelsGoal}
                statGoal={statGoal}
              />
            </div>
          )
          : badResult || selectedActionCount === badEndActionCount ? (
            <div>
              <h3 className="font-medium text-primary text-center mb-2">Goal Impossible</h3>
              <p className="text-primary text-center mb-2">
                <i className="opacity-60">Target cannot be reached with selected action.</i>
              </p>
              <BadEndTable 
                petType={petType}
                levels={selectedAction === "up" ? [...levels, 1] : levels}
                levelsGoal={levelsGoal}
                statGoal={statGoal}
              />
            </div>
          ) 
          : (
            <CostTable 
              selectedActionCount={selectedActionCount}
              levels={levels}
              exp={exp}
              costUp={costUp}
              costSac={costSac}
            />
          )}
        </CardContent>
      </Card>
      <Card className="m-2">
        <CardHeader>
          <CardTitle>Possible Outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="actionSelect">Action</Label>
          <Select value={selectedAction} onValueChange={(e) => setSelectedAction(e)}>
            <SelectTrigger id="actionSelect" className="mb-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {
                currentResult.map(({ action }, index) => {
                  return(
                    <SelectItem key={"prob" + action} value={action}>
                      { 
                        !goodResult && !badResult && index === 0 ? actionString(action, levels) + " (Best)" 
                        : actionString(action, levels) 
                      }
                    </SelectItem>
                  )
                })
              }
            </SelectContent>
          </Select>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Levels</TableHead>
                <TableHead className="text-right pl-0">Stat</TableHead>
                <TableHead className="text-right pl-0">Cost Left</TableHead>
                <TableHead className="text-right pl-0">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {successorTableEntries.map(({state, stat, cost, prob}) => (
                <TableRow key={state}>
                  <TableCell className="text-left">{state}</TableCell>
                  <TableCell className="text-right pl-0">{stat}</TableCell>
                  <TableCell className="text-right pl-0">{cost}</TableCell>
                  <TableCell className="text-right pl-0">{prob}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PetResults({ petType, levels, exp, statGoal, levelsGoal, sacPrices, candyPrices }: {
  petType: Pet | undefined
  levels: number[]
  exp: number
  statGoal: number
  levelsGoal: number[]
  sacPrices: Record<SacTier, number>
  candyPrices: Record<RaiseTier, number>
}) {
  if (!petType) {
    return (
      <div className="my-20 text-center">
        <i className="text-primary opacity-60">Please complete Pet Info to see results.</i>
      </div>
    )
  }

  // Calculate raise cost from candy cost and exp
  const costUp = costToRaise(levels, exp, candyPrices)

  // Calculate results
  const results = calculatePetCost(petType, levelsGoal, statGoal, costUp, sacPrices)

  return (
    <ActionResults 
      petType={petType}
      results={results}
      levels={levels}
      exp={exp}
      levelsGoal={levelsGoal}
      statGoal={statGoal}
      candyPrices={candyPrices}
      costUp={costUp}
      costSac={sacPrices}
    />
  )
}