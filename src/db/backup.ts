import path from "path";
import { v4 as uuid } from "uuid";
import { promises as fs, createWriteStream } from "fs";
import { spawn, exec } from "child_process";

export const createBackup = (tag: string = "normal") =>
  new Promise<{ id: string; filename: string }>((res, rej) => {
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

    mysqldump.stdout
      .pipe(wstream)
      .on("finish", () => {
        res({ id, filename });
      })
      .on("error", function (err) {
        rej(err);
      });
  });

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
