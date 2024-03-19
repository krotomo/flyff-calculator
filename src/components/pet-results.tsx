import statesByDepth from "../data/states-by-depth.json"

const numberFormat = new Intl.NumberFormat("en-us")

const formatThousands = (inputValue: number) => numberFormat.format(Math.round(inputValue))

export default function PetResults({ petType, levels, exp, statGoal, levelsGoal, sacPrices, candyPrices }: {
  petType: Pet;
  levels: number[];
  exp: number;
  statGoal: number;
  levelsGoal: number[];
  sacPrices: Record<SacTier, number>;
  candyPrices: Record<RaiseTier, number>;
}) {
  const p: Record<Tier, Partial<Record<Tier, number[]>>> = {
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

  const tiers: Tier[] = ["f", "f", "e", "d", "c", "b", "a", "s"]

  const candyPerTier: Record<RaiseTier, number> = {
    "f": 20,
    "e": 20,
    "d": 25,
    "c": 25,
    "b": 25,
    "a": 50,
  }
  
  const costUp: Record<RaiseTier, number> = {} as Record<RaiseTier, number>
  Object.keys(candyPrices).forEach((tier) => {
    if (tier === tiers[levels.length]) {
      costUp[tier as RaiseTier] = Math.round( candyPerTier[tier as RaiseTier] * (1-(( exp ? exp : 0 )/100)) ) * candyPrices[tier as RaiseTier]
    }
    else {
      costUp[tier as RaiseTier] = candyPerTier[tier as RaiseTier] * candyPrices[tier as RaiseTier]
    }

  })

  const costSac = sacPrices
  
  const levelsPerTier: { [key in Tier]: number } = {
    "f": 1,
    "e": 2,
    "d": 3,
    "c": 4,
    "b": 5,
    "a": 7,
    "s": 9,
  }
  
  const statsByPetType: { [key in Pet]: number[] } = {
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
  
  function actions(state: number[]): string[] {
    const tier = tiers[state.length]
    const result: string[] = []
    if (tier !== "s") result.push("up")
    if (
      tier !== "f" && 
      state.slice(-1)[0] < levelsPerTier[tier]
    ) {
      for (const sac in p[tier]) {
        result.push(sac)
      }
    }
    return result
  }
  
  function statsTotal(state: number[]): number {
    let sum = 0
    for (const level of state) {
      sum += statsByPetType[petType][level-1]
    }
    return sum
  }
  
  function isGoodEnd(state: number[]): boolean {
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
    else return statsTotal(state) >= statGoal!
  }
  
  function isBadEnd(state: number[]): boolean {
    for (const [index, level] of state.entries()) {
      if (index < state.length-1 && levelsGoal && level < levelsGoal[index]) {
        return true
      }
    }
    return (
      tiers[state.length] == "s" &&
      state.slice(-1)[0] == 9 &&
      statsTotal(state) < statGoal
    )
  }
  
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
      "f": 0,
      "e": 0,
      "d": 0,
      "c": 0,
      "b": 0,
      "a": 0,
    }
  
    addFactor(other: ActionCount, factor: number) {
      for (const tier in other.sac) {
        this.sac[tier as SacTier] += other.sac[tier as SacTier] * factor
      }
      for (const tier in other.up) {
        this.up[tier as RaiseTier] += other.up[tier as RaiseTier] * factor
      }
    }
  }
  
  const goodEndActionCount = new ActionCount()
  const badEndActionCount = new ActionCount()
  for (const tier in badEndActionCount.sac) {
    badEndActionCount.sac[tier as SacTier] = Infinity
  }
  for (const tier in badEndActionCount.up) {
    badEndActionCount.up[tier as RaiseTier] = Infinity
  }

  function candyCostFromActionCount(actionCount: ActionCount) {
    let cost = 0
    for (const tier in actionCount.up) {
      cost += actionCount.up[tier as RaiseTier] * costUp[tier as RaiseTier]
    }
    return cost
  }

  function sacCostFromActionCount(actionCount: ActionCount) {
    let cost = 0
    for (const tier in actionCount.sac) {
      cost += actionCount.sac[tier as SacTier] * costSac[tier as SacTier]
    }
    return cost
  }

  function costFromActionCount(actionCount: ActionCount) {
    let cost = 0
    cost += candyCostFromActionCount(actionCount)
    cost += sacCostFromActionCount(actionCount)
    return cost
  }
  
  function calculatePetCost() {
    const stateActionCounts: {
      [key: string]: {
        action: string,
        actionCount: ActionCount
      }[]
    } = {}
    
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
        if (isGoodEnd(state)) {
          stateActionCounts[JSON.stringify(state)] = [{
            action: "none",
            actionCount: goodEndActionCount
          }]
        }
        else if (isBadEnd(state)) {
          stateActionCounts[JSON.stringify(state)] = [{
            action: "none",
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
              isNaN(costFromActionCount(b.actionCount)) || 
              costFromActionCount(a.actionCount) < costFromActionCount(b.actionCount)
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

  const results = calculatePetCost()
  const result = results[JSON.stringify(levels)]

  return (
    <div className="basis-1/2">
      <div>
        <h2>
          Total Cost: { formatThousands(costFromActionCount(result[0].actionCount)) }
        </h2>
      </div>
      <div>
        <h3>
          Sac Pet Cost: { formatThousands(sacCostFromActionCount(result[0].actionCount)) }
        </h3>
        {
          Object.keys(result[0].actionCount.sac).map((tier) => {
            return(
              result[0].actionCount.sac[tier as SacTier] > 0 && 
              <div>
                {tier}: { formatThousands(result[0].actionCount.sac[tier as SacTier] * costSac[tier as SacTier]) }
              </div>
            )
          })
        }
      </div>
      <div>
        <h3>Pet Candy Cost: { formatThousands(candyCostFromActionCount(result[0].actionCount)) }</h3>
        {
          Object.keys(result[0].actionCount.up).map((tier) => {
            return(
              result[0].actionCount.up[tier as RaiseTier] > 0 && 
              <div>
                {tier}: { formatThousands(result[0].actionCount.up[tier as RaiseTier] * costUp[tier as RaiseTier]) }
              </div>
            )
          })
        }
      </div>
    </div>
  );
}