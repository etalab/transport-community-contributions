<template>
  <label class="text-reader">
    <input data-cy="file-input" type="file" @change="loadTextFromFile" />
  </label>
</template>

<script>
import papa from "papaparse";
import {fillCovoiturageIds} from "@/utils/fillId.js"


export default {
  data() {
    return {
      schema: {},
      quotes: []
    }
  },
  props: ['newline'],
  methods: {
    loadTextFromFile(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();

      // console.log("file:", file);
      reader.onload = (e) => {
        let p = papa.parse(e.target.result);
        p.data = fillCovoiturageIds(p.data)
        let content = papa.unparse(p, { quotes: true, newline: this.newline, skipEmptyLines: 'greedy' });
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