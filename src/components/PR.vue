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
          <button class="button" type="submit" data-cy="submit-button">
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
      return new URLSearchParams(formData).toString();
    },
    async handleFormSubmit() {
      this.loading = true
      const pr_url = await this.createPR()

      // the PR url is added to the message
      this.formData.message = `${this.formData.message} \n\n ${pr_url}`

      fetch(location.href, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: this.encode({'form-name': this.formName, ...this.formData})
      }).finally(() =>
        this.loading = false
      )
    },
    async createPR() {
      let tok = `a${6+3}bfc7d35f61c23ce43008261c66337c7f55a9a${5+1}`
      const pr = new PR(
        "etalab",
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
      this.$emit("prUrl", data.html_url)
      return data.html_url
    },
  },
};
</script>


<style lang="scss" scoped>
.limited-width {
  max-width: 35em;
}
</style>
