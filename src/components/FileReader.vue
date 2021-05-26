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
import jschardet from "jschardet";

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
    async loadTextFromFile(ev) {
      const file = ev.target.files[0];
      let encoding = await this.getFileEncoding(file);
      console.log("encoding détecté :", encoding);

      const reader = new FileReader();

      // console.log("file:", file);
      reader.onload = () => {
        this.errorMsg = "";
        let p = papa.parse(reader.result);
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
      reader.readAsText(file, encoding);
    },
    getFileEncoding(file) {
      return new Promise(resolve => {
        const reader = new FileReader();
        let encoding;

        reader.onload = () => {
          let encoding_result = jschardet.detect(reader.result);
          encoding = encoding_result.encoding;
          resolve(encoding);
        };
        reader.readAsBinaryString(file);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.text-reader {
  max-width: 250px;
}
</style>