// Picks an illustration for a recipe from its name. Anything unrecognised
// (including the learned "My Perfect Cup") gets the heart cup.

import HeartCupIcon from "../HeartCupIcon";
import {
  CoffeeBagIcon,
  CoffeeWithCreamIcon,
  FrappeIcon,
  LeafBeansIcon,
  RegularCoffeeIcon,
} from "./CoffeeIcons";

export default function RecipeIcon({
  name,
  size = 64,
}: {
  name?: string;
  size?: number;
}) {
  const n = (name ?? "").toLowerCase();
  if (n.includes("cream") || n.includes("latte"))
    return <CoffeeWithCreamIcon size={size} />;
  if (n.includes("dark")) return <CoffeeBagIcon size={size} />;
  if (n.includes("light")) return <LeafBeansIcon size={size} />;
  if (n.includes("frapp") || n.includes("iced") || n.includes("cold"))
    return <FrappeIcon size={size} />;
  if (n.includes("regular") || n.includes("americano") || n.includes("black"))
    return <RegularCoffeeIcon size={size} />;
  return <HeartCupIcon width={size} />;
}
