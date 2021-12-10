import path from "path";
import crypto from "crypto-js";
import { v4 as uuid } from "uuid";
import { promises as fs, createWriteStream } from "fs";
import { spawn, exec } from "child_process";

const { version } = require("../../package.json");

type Stats = { VERSION: string; SHA: string; DATE: string; TAG?: string };

export const parseStats = (line: string) => {
  const result: Stats = {
    VERSION: "",
    SHA: "",
    DATE: "",
  };
  const entries = line.split(";");
  for (const pair of entries) {
    const [key, value] = pair.split("::").map((v) => v.trim());
    result[key as keyof typeof result] = value;
  }

  if (!result.SHA || !result.VERSION || !result.DATE)
    throw new Error("SHA, VERSION and DATE required");

  return result;
};

export const createStats = (stats: Stats) => {
  let result = "";
  for (const key in stats) result += `${key}::${stats[key as keyof Stats]};`;
  return result;
};

export const createBackup = async (tag: string = "normal") => {
  const stamp = Date.now();

  const id = uuid();

  const filename = path.resolve(
    __dirname,
    `../../backup/${stamp}_${id}_${tag}.sql`
  );

  const wstream = createWriteStream(filename);

  const mysqldump = spawn("mysqldump", [
    "-h" + process.env.DB_HOST,
    "-P" + process.env.DB_PORT,
    "-u" + process.env.DB_USERNAME,
    "-p" + process.env.DB_PASSWORD,
    process.env.DB_NAME,
  ]);

  await new Promise<void>((res, rej) => {
    mysqldump.stdout
      .pipe(wstream)
      .on("finish", () => {
        res();
        wstream.close();
      })
      .on("error", function (err) {
        rej(err);
      });
  });

  const file = await fs.open(filename, "r+");
  const content = await file.readFile({ encoding: "utf8" });

  const sha = crypto
    .HmacSHA256(content, process.env.SECRET)
    .toString(crypto.enc.Hex);

  const stats = createStats({
    SHA: sha,
    VERSION: version,
    TAG: tag,
    DATE: new Date().toISOString(),
  });
  const header = `-- ${stats}\n`;
  await file.write(header + content, 0);
  await file.close();

  return { id, filename };
};

export const getBackups = async (filter: { tag?: string; id?: string }) => {
  const dir = await fs.readdir(path.resolve(__dirname, `../../backup/`));
  const files: string[] = [];
  for (const file of dir) {
    const [stamp, id, tag] = file.slice(0, -4).split("_");

    if (filter.tag && tag !== filter.tag) continue;
    if (filter.id && id !== filter.id) continue;

    if (id === filter.id) return [file];

    files.push(file);
  }

  return files;
};

export const removeBackup = async (filename: string) => {
  const backupPath = path.resolve(__dirname, `../../backup/${filename}`);
  await fs.unlink(backupPath);
};

export const revertBackup = (filename: string) =>
  new Promise<void>(async (res, rej) => {
    const backupPath = path.resolve(__dirname, `../../backup/${filename}`);

    exec(
      `mysql -u${process.env.DB_USERNAME} -p${process.env.DB_PASSWORD} -h${process.env.DB_HOST} ${process.env.DB_NAME} < ${backupPath}`,
      (err, stdout, stderr) => {
        if (err) return rej(err);
        res();
      }
    );
  });
