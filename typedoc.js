module.exports = {
  entryPoints: ["./src/index.ts"],
  plugin: "typedoc-plugin-markdown",
  name: "# Masa Express\n",
  out: "docs",
  disableSources: true,
  includeVersion: true,
};
