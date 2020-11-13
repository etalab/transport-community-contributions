<template>
  <div class="pt-24">
    <div class="form__group limited-width">
      <input type="email" placeholder="Adresse email de contact">
    </div>
    <div class="form__group limited-width">
      <input type="text" placeholder="Nom">
    </div>
    <div class="form__group">
      <textarea v-model="description" name="" id="" cols="30" rows="5" placeholder="Description des changements"></textarea>
    </div>
    <button class="button primary" @click="createPR()">Envoyer la demande de modification</button>
    <div>
      <div v-if="loading" class="lds-ring"><div></div><div></div><div></div><div></div></div>
    </div>
  </div>
</template>

<script>
import PR from "@prb0t/pr";

export default {
  name: "PR",
  props: ["fileContent"],
  data() {
    return {
      description: '',
      loading: false
    }
  },
  methods: {
    async createPR() {
      this.loading = true
      let tok = `a${6+3}bfc7d35f61c23ce43008261c66337c7f55a9a${5+1}`
      const pr = new PR(
        "betagouv",
        "transport-base-nationale-covoiturage",
        "main",
        tok
      );

      pr.configure(
        [{ path: "bnlc-.csv", content: this.fileContent }],
        "Modification de la base",
        "Modification de la base",
        this.description,
        {
          name: "un contributeur dévoué",
          email: "contributeur@coucou.fr",
        }
      );
      const { data } = await pr.send(); // data holds the response of the PR creation.
      this.loading = false
      this.$emit("prUrl", data.html_url)
    },
  },
};
</script>


<style lang="scss" scoped>
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

.limited-width {
  max-width: 300px;
}

</style>
