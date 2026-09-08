import midnightSeoul from "@/assets/drama-midnight-seoul.jpg";
import lastHeir from "@/assets/drama-the-last-heir.jpg";
import hanbokHouse from "@/assets/drama-hanbok-house.jpg";
import signalNine from "@/assets/drama-signal-nine.jpg";
import springAgain from "@/assets/drama-spring-again.jpg";

const posters: Record<string, string> = {
  "midnight-seoul": midnightSeoul,
  "the-last-heir": lastHeir,
  "hanbok-house": hanbokHouse,
  "signal-nine": signalNine,
  "spring-again": springAgain,
};

export function posterFor(slug?: string | null): string {
  return (slug && posters[slug]) || midnightSeoul;
}
