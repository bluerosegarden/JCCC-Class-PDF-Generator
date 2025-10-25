import * as fs from "node:fs";

const bookmarklet = await fs.readFileSync("./src/bookmarklet/bookmarklet-minified.js", "utf-8")

const data = {
  bookmarklet: `javascript:${encodeURIComponent(bookmarklet)}`
}

export default data;
