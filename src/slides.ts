import { Glob } from "bun";

const glob = new Glob("slides/*");
const slides = await Array.fromAsync(glob.scan());

const buildDate = new Date().getTime();

export default function getStuff() {
  return { buildDate, slides };
}
