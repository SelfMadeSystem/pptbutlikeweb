import { Glob } from "bun";

const glob = new Glob("slides/*");
const slides = await Array.fromAsync(glob.scan());

console.log("pwd:", process.cwd());
console.log("Slides found:", slides);

const buildDate = new Date().getTime();

export default function getStuff() {
  return { buildDate, slides };
}
