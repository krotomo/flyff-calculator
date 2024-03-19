type Pet = 
  "unicorn" | "dragon" | "griffin" | "angel" | 
  "crab" | "tiger" | "lion" | "rabbit" | "fox";

type Tier =
  "egg" | "f" | "e" | "d" | "c" | "b" | "a" | "s"

type SacTier =
  Exclude<Tier, "egg" | "f">

type RaiseTier =
  Exclude<Tier, "s">

declare class ActionCount { 
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

  addFactor(other: ActionCount, factor: number) {
    for (const tier in other.sac) {
      this.sac[tier as SacTier] += other.sac[tier as SacTier] * factor
    }
    for (const tier in other.up) {
      this.up[tier as RaiseTier] += other.up[tier as RaiseTier] * factor
    }
  }
}