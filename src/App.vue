<template>
  <div id="app">
    <div class="container">
      <header class="navbar">
        <div class="navbar__container">
          <a href="transport.data.gouv.fr" class="navbar__home"
            ><img
              src="/logo-header.svg"
              alt="transport.data.gouv.fr"
              class="navbar__logo"
          /></a>
        </div>
      </header>
      <div class="pt-48">
        <h1>
          Proposer un ajout ou une modification à la base nationale de
          covoiturage
        </h1>
      </div>
      <div class="pt-24">
        <p>
          La Base Nationale des Lieux de Covoiturage (BNLC) est hébergée
          <a
            href="https://github.com/etalab/transport-base-nationale-covoiturage"
            >sur github</a
          >.
        </p>
        <p>
          Elle est référencée sur
          <a
            href="https://www.data.gouv.fr/fr/datasets/base-nationale-des-lieux-de-covoiturage"
            >data.gouv.fr</a
          >
          et sur
          <a
            href="https://transport.data.gouv.fr/datasets/base-nationale-des-lieux-de-covoiturage"
            >transport.data.gouv.fr</a
          >.
        </p>
      </div>

      <div v-if="fileAvailable === undefined">
        <div class="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        Chargement...
      </div>
      <div v-else-if="!fileAvailable">
        <span class="error"
          >⚠️ Le service de contribution est temporairement indisponible.</span
        >
      </div>
      <div v-else>
        <p>
          Toute personne peut proposer d'y apporter des modifications simplement
          en suivant les étapes suivantes :
        </p>
        <ol>
          <div class="pt-24">
            <li>
              Téléchargez la
              <a :href="downloadUrl" download="bnlc-.csv">base actuelle</a>
            </li>
          </div>
          <li>
            Apportez y les modifications souhaitées sur votre poste,
            <a
              href="https://schema.data.gouv.fr/etalab/schema-lieux-covoiturage/latest/documentation.html"
              target="_blank"
              >en suivant le schéma imposé</a
            >.
            <br>
            Laissez la colonne <strong>id_lieu</strong> vide, elle sera remplie automatiquement.
          </li>
          <li>
            Chargez le fichier modifié :
            <file-reader
              :newline="newline"
              @load="handleNewFile($event)"
              @geojson="geojson = $event"
            ></file-reader>
            <br />
          </li>
          <div v-if="newFile" class="pt-24">
            <div v-if="diff.length">
              Voici les modifications que vous souhaitez apporter à la base.<br />
              Les ajouts apparaissent en <span class="diff-add">vert</span>, les
              suppressions en <span class="diff-delete">rouge</span>.
            </div>
            <div v-else>
              Aucune modification de contenu n'a été détectée avec la base
              actuelle.
            </div>
            <div class="mt-24 panel overflow-auto">
              <span
                v-for="(d, i) in diff"
                v-bind:key="`diff-${i}`"
                v-bind:class="getClass(d[0])"
                style="white-space: pre-line"
              >
                <span v-if="d[0] === 2">
                  <br />
                  <br />
                </span>
                <span v-else>
                  {{ d[1] }}
                </span>
              </span>
            </div>
          </div>
          <div v-if="newFile" class="pt-24" data-cy="is-file-valid">
            <span v-if="validFile === true">
              <span style="color: green">✓</span> Le fichier est valide selon
              <a
                href="https://schema.data.gouv.fr/etalab/schema-lieux-covoiturage/latest.html"
                >schema.data.gouv.fr</a
              >
              <div
                class="pt-24"
                style="cursor: pointer"
                @click="showMap = true"
                data-cy="show-the-map-link"
              >
                🗺️ Voir la carte
              </div>
              <Map v-if="showMap" :geojson="geojson"></Map>
            </span>
            <span v-else-if="validFile === false">
              <span style="color: red">❌</span> Le fichier n'est pas valide
              selon schema.data.gouv.fr. Pour en savoir plus sur les erreurs de
              la validation détectées, rendez-vous sur
              <a
                href="https://validata.etalab.studio/table-schema?schema_url=https://schema.data.gouv.fr/schemas/etalab/schema-lieux-covoiturage/0.2.0/schema.json"
                >cette page</a
              >
              et validez vos données. Vous aurez accès à un rapport d'erreur.
            </span>
            <span v-else>
              Validation du fichier par schema.data.gouv.fr
              <div class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </span>
          </div>
          <li v-if="newFile && validFile && diff.length" class="pt-24" data-cy="request-modification-form">
            Soumettre la demande de modification
            <p-r :file-content="newFile" @prUrl="prUrl = $event" />
          </li>
          <li v-if="prUrl">La demande a été créée. Vous pouvez la voir <a :href="prUrl">ici</a> !  </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>
import DiffMatchPatch from "diff-match-patch";
import PR from "./components/PR";
import FileReader from "./components/FileReader";
import Map from "./components/Map";

export default {
  name: "App",
  components: {
    PR,
    FileReader,
    Map
  },
  data() {
    return {
      newline: "\r\n",
      downloadUrl: "",
      diff: "",
      file: "",
      newFile: "",
      prUrl: "",
      validFile: undefined,
      fileAvailable: undefined,
      geojson: {},
      showMap: false
    };
  },
  methods: {
    getClass(code) {
      if (code === -1) {
        return "diff-delete";
      } else if (code === 1) {
        return "diff-add";
      } else {
        return "no-diff";
      }
    },
    resetAll() {
      this.diff = ""
      this.newFile = ""
      this.prUrl = ""
      this.validFile = undefined
      this.showMap = false
    },
    handleNewFile(newFileContent) {
      this.resetAll();
      this.newFile = newFileContent;
      const dmp = new DiffMatchPatch();

      this.diff = dmp.diff_main(this.file, this.newFile);
      // console.log('diff:', this.diff)
      dmp.diff_cleanupSemantic(this.diff);
      // console.log("this.diff:", this.diff);
      this.diff = this.keepOnlyDiffContext(this.diff, 0);
      this.getFileValidation();
    },
    getFileValidation() {
      let formData = new FormData();
      formData.append(
        "schema",
        "https://schema.data.gouv.fr/schemas/etalab/schema-lieux-covoiturage/0.2.0/schema.json"
      );
      const file = new File([this.newFile], "newFile.csv", {type: 'text/csv;charset=utf-8;'})
      formData.append("file", file);

      fetch("https://go.validata.fr/api/v1/validate", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      })
        .then((data) => data.json())
        .then((res) => {
          this.validFile = res.report.valid;
        });
    },
    keepOnlyDiffContext(diff) {
      let diffIndex = diff.reduce((acc, d, i) => {
        // keep only index of modifications
        if (d[0] !== 0) {
          acc.push(i);
        }
        return acc;
      }, []);

      // console.log("diffIndex:", diffIndex);
      let filteredDiffs = [];
      for (let i of diffIndex) {
        // if there is a previous element and it is not modified, show it
        if (i > 0 && this.diff[i - 1][0] === 0) {
          let array = this.diff[i - 1][1].split(this.newline);
          if (array.length > 1) {
            filteredDiffs.push([0, array[array.length - 2]]);
            filteredDiffs.push([0, this.newline])
          }
          filteredDiffs.push([0, array[array.length - 1]]);
        }
        filteredDiffs.push(this.diff[i]);
        if (i < this.diff.length - 1 && this.diff[i + 1][0] === 0) {
          let array = this.diff[i + 1][1].split(this.newline);
          filteredDiffs.push([0, array[0]]);
          if (array.length > 1) {
            filteredDiffs.push([0, this.newline])
          }
          filteredDiffs.push([2, "stop"]);
        }
      }
      // console.log("filteredDiffs:", filteredDiffs);
      return filteredDiffs;
    },
  },
  mounted() {
    fetch(
      "https://raw.githubusercontent.com/etalab/transport-base-nationale-covoiturage/main/bnlc-.csv"
    )
      .then(response => {
        if (!response.ok) {
          throw new Error("file not fetched properly");
        }
        this.fileAvailable = true;
        return response.text();
      })
      .then(data => {
        this.file = data;
        let blob = new Blob([data], { type: "text/csv" });
        this.downloadUrl = window.URL.createObjectURL(blob);
      })
      .catch(error => {
        console.error("La base n'est pas disponible", error);
        this.fileAvailable = false;
      });
  },
};
</script>

<style lang="scss">
@import "~template.data.gouv.fr/dist/main.css";

#app {
  background-color: var(--theme-background-grey);
  min-height: 100vh;
  .container {
    background-color: white;
    min-height: 100vh;
    padding: 48px;
  }
}

.error {
  color: red;
}

.diff-delete {
  background-color: pink;
  text-decoration: line-through;
}
.diff-add {
  background-color: greenyellow;
}

.pt-48 {
  padding-top: 48px;
}

.pt-24 {
  padding-top: 24px;
}
.mt-24 {
  margin-top: 24px;
}

li {
  padding-bottom: 12px;
}

.overflow-auto {
  overflow: auto;
}

.lds-ring {
  display: inline-block;
  position: relative;
  width: 20px;
  height: 20px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 16px;
  height: 16px;
  margin: 2px;
  border: 2px solid rgb(0, 0, 0);
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: rgb(0, 0, 0) transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
