import path from "path";
import { promises as fs, createWriteStream } from "fs";
import { spawn, exec } from "child_process";

export const makeBackup = (tag: string = "normal") =>
  new Promise<void>((res, rej) => {
    const stamp = Date.now();

    const backupPath = path.resolve(
      __dirname,
      `../../backup/${stamp}_${tag}.sql`
    );
    const wstream = createWriteStream(backupPath);

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
        res();
      })
      .on("error", function (err) {
        rej(err);
      });
  });

export const loadBackup = (name: string) =>
  new Promise<void>(async (res, rej) => {
    const backupPath = path.resolve(__dirname, `../../backup/${name}.sql`);

    exec(
      `mysql -u${process.env.DB_USERNAME} -p${process.env.DB_PASSWORD} -h${process.env.DB_HOST} ${process.env.DB_NAME} < ${backupPath}`,
      (err, stdout, stderr) => {
        if (err) return rej(err);
        res();
      }
    );
  });
