<template>
  <div class="pt-24">
    <div class="limited-width">
      <form
        :name="formName"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        @submit.prevent="handleFormSubmit"
      >
        <input type="hidden" name="form-name" :value="formName" />
        <p>
          <input
            type="text"
            name="name"
            placeholder="Nom"
            v-model="formData.nom"
          />
        </p>
        <p>
          <input
            type="email"
            name="email"
            placeholder="Email"
            v-model="formData.email"
          />
        </p>
        <p>
          <input
            type="text"
            name="Iam"
            placeholder="Je suis ..."
            v-model="formData.iam"
          />
        </p>
        <p>
          <textarea
            name="message"
            placeholder="Description publique des modifications proposées"
            v-model="formData.message"
          ></textarea>
        </p>
        <p>
          <button class="button" type="submit">
            Envoyer la demande de modification
          </button>
        </p>
      </form>
    </div>

    <div>
      <div v-if="loading" class="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
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
      loading: false,
      formName: 'proposition_de_modification',
      formData: {nom: '', iam: '', email:'', message: ''}
    }
  },
  methods: {
    encode(data) {  
      const formData = new FormData();
      for (const key of Object.keys(data)) {
          formData.append(key, data[key]);
      }
      return formData;
    },
    handleFormSubmit() {
      const pr_url = this.createPR()

      // the PR url is added to the message
      this.formData.message = `${pr_url} \n ${this.formData.message}`

      fetch(location.href, {
        method: "POST",
        headers: "content-type: application/x-www-form-urlencoded",
        body: this.encode({name: this.formName, ...this.formData})
      })

      
    },
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
        "Proposition de Modification",
        "Proposition de Modification",
        this.formData.message,
        {
          name: "Un contributeur anonyme",
          email: "contact@transport.data.gouv.fr",
        }
      );
      const { data } = await pr.send(); // data holds the response of the PR creation.
      this.loading = false
      this.$emit("prUrl", data.html_url)
      return data.html_url
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
  max-width: 35em;
}
</style>
