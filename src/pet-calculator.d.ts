type Pet = 
  "unicorn" | "dragon" | "griffin" | "angel" | 
  "crab" | "tiger" | "lion" | "rabbit" | "fox";

type Tier =
  "f" | "e" | "d" | "c" | "b" | "a" | "s"

type SacTier =
  Exclude<Tier, "f">

type RaiseTier =
  Exclude<Tier, "s">