<template>
  <label class="text-reader">
    <input type="file" @change="loadTextFromFile" />
  </label>
</template>

<script>
import papa from "papaparse";

// let quotesRules = {
//   string: true,

// }

export default {
  data() {
    return {
      schema: {},
      quotes: []
    }
  },
  methods: {
    loadTextFromFile(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();

      console.log("file:", file);
      this.$emit("file", file);
      reader.onload = (e) => {
        let p = papa.parse(e.target.result);
        let content = papa.unparse(p, { quotes: true });
        this.$emit("load", content);
      };
      reader.readAsText(file);
    },
  },
};
</script>

<style lang="scss" scoped>
.text-reader {
  max-width: 250px;
}
</style>