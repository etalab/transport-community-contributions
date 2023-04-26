const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // specPattern: "tests/e2e/**/*.cy.js",
  },

  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },
});
