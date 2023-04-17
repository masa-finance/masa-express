module.exports = {
  entryPoints: ["./src/index.ts"],
  plugin: "typedoc-plugin-markdown",
  name: "Masa Express",
  out: "docs",
  disableSources: true,
  includeVersion: true,
};
