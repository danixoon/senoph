import { ReadStream } from "fs";
import { promises as fs } from "fs";
import path from "path";

type CallMap = { from: string; to: string; time: string; log: string };

const init = async () => {
  const file = await fs.open(path.resolve(__dirname, "./dx050514.blg"), "r");
  const content = await file.readFile();
  const buffer = content.toString().split("\r");

  const regex =
    /(\d\d\d\d\d)\s(\d\d\d\d)\s\s\s\s\s\s(....)(.+?)\(.+?\s(\d\d\/\d\d\/\d\d)\s(\d\d:\d\d)\s(\d\d:\d\d:\d\d)/; //\s(.+)\s(.+)\s(.+)\s/;//\(\d\d\.\d\d\d\)\s(.+)\s(\d\d:\d\d)\s(\d\d:\d\d:\d\d)/;

  const map: CallMap[] = [];

  for (const line of buffer) {
    const match = regex.exec(line);
    if (!match) continue;

    const log = match[0].trim();
    const from = match[2].trim();
    const to = match[3].trim() == "" ? match[4].trim() : match[3].trim();

    const time = `${match[5]} ${match[6]}`;

    map.push({ from, to, time, log });
  }

  const lol = map.filter((item) => item.from === "4012");
  const maps = new Map<string, CallMap[]>();

  for (const item of lol) {
    maps.set(item.to, [...(maps.get(item.to) ?? []), item]);
  }

  const real = Array.from(maps.entries()).sort(([key1, a], [key2, b]) =>
    a.length < b.length ? 1 : -1
  );

  console.log(real.map(([key, items]) => `${key}: ${items.length}`));
};

init();
