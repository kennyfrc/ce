#! /usr/bin/env node

require("jsdom-global")(undefined, { url: "https://localhost" });

// @ts-ignore
global.root = document.createElement("div");
// @ts-ignore
global.root.style.width = "100%";
// @ts-ignore
global.root.style.height = "100%";
// @ts-ignore
global.root.innerHTML = "";
// @ts-ignore
document.body.appendChild(global.root);

exports.mochaHooks = {
  afterEach(done) {
    // destroy datagrid component
    // @ts-ignore
    global.root.innerHTML = "";
    done();
  },
};
