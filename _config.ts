import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";

const site = lume({
  src: "./src",

});

site.add("/js/script.js")

site.use(tailwindcss({
 extensions: [".html", ".jsx"],
}));
site.add("/style.css")
site.add("/bookmarklet-ver.json")
site.add("/templates/paper-classes.typ")
site.add("/templates/grouped-paper-classes.typ")
site.add("/bookmarklet/bookmarklet-minified.js")

export default site;
