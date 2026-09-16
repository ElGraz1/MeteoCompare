const fs = require("fs");

let html = fs.readFileSync(
  "./roma.html",
  "utf8"
);

console.log(
  html.includes("&lt;tr&gt;")
);

console.log(
  html.includes("<tr>")
);
``