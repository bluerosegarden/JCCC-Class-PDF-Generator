import * as fs from "node:fs";

const bookmarklet = await fs.readFileSync("./src/bookmarklet/bookmarklet-minified.js", "utf-8")
const bookmarklet_ver_str = await fs.readFileSync("./src/bookmarklet-ver.json", "utf-8")
const bookmarklet_ver = JSON.parse(bookmarklet_ver_str)

const data = {
  bookmarklet: `javascript:${encodeURIComponent(bookmarklet)}`,
  bookmarklet_ver: bookmarklet_ver.version
}

export default data;
