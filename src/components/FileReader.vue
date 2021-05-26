<template>
  <div>
    <label class="text-reader">
      <input data-cy="file-input" type="file" @change="loadTextFromFile" />
    </label>
    <div v-if="errorMsg" class="pt-24" data-cy="show-file-processing-errors">
      Erreur : {{ errorMsg }}
    </div>
  </div>
</template>

<script>
import papa from "papaparse";
import { fillCovoiturageIds } from "@/utils/fillId.js";
import { createGeoJSON } from "@/utils/createGeoJSON.js";

export default {
  data() {
    return {
      schema: {},
      quotes: [],
      errorMsg: ""
    };
  },
  props: ["newline"],
  methods: {
    loadTextFromFile(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();

      // console.log("file:", file);
      reader.onload = e => {
        this.errorMsg = "";
        let p = papa.parse(e.target.result);
        try {
          const geojson = createGeoJSON(p.data);
          p.data = fillCovoiturageIds(p.data);
          let content = papa.unparse(p, {
            quotes: true,
            newline: this.newline,
            skipEmptyLines: "greedy"
          });
          let blob = new Blob([content], { type: "text/csv" });
          let downloadConvertedFileUrl = window.URL.createObjectURL(blob);

          this.$emit("filledFileUrl", downloadConvertedFileUrl);
          this.$emit("load", content);
          this.$emit("geojson", geojson);
        } catch (error) {
          this.errorMsg = error;
          this.$emit("load", undefined);
        }
      };
      reader.readAsText(file);
    }
  }
};
</script>

<style lang="scss" scoped>
.text-reader {
  max-width: 250px;
}
</style>