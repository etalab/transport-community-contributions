<template>
  <div>
    <br>
    <textarea v-model="description" name="" id="" cols="30" rows="5" placeholder="description des changements"></textarea><br>
    <button @click="createPR()">Submit changes</button>
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
      const pr = new PR(
        "fchabouis",
        "test-collaborative-file",
        "master",
        "c1913b3bc7e10f76043020273d35d21a102fc4bb"
      );

      pr.configure(
        [{ path: "bnlc-.csv", content: this.fileContent }],
        "commit : modif base",
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


<style>
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
