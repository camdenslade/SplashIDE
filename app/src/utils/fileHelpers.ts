import fs from "fs";

export function readFile(p: string) {
  return fs.readFileSync(p, "utf8");
}

export function writeFile(p: string, data: string) {
  fs.writeFileSync(p, data, "utf8");
}
