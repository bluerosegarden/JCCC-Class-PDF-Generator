import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";

const site = lume({
  src: "./src",

});

site.add("/js/script.js")

site.use(tailwindcss(/* Options */));
site.add("/style.css")

export default site;
