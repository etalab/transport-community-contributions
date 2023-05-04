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
        <p v-if="!prIsSubmitted">
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
    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { createAnonymousPR } from "../utils/anonymousPR.js";
import { Base64 } from "js-base64";

export default {
  name: "PR",
  props: ["fileContent"],
  data() {
    return {
      description: '',
      loading: false,
      formName: 'proposition_de_modification',
      formData: {nom: '', iam: '', email:'', message: ''},
      errorMessage: '',
      prIsSubmitted: false
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
      this.prIsSubmitted = true
      let pr_url
      try {
        pr_url = await this.createPR(this.formData.message)
      } catch(e) {
        this.loading = false
        this.errorMessage = "La demande de modification a échoué. Merci de nous contacter à l'adresse contact@transport.beta.gouv.fr"
        return
      }

      // the PR url is added to the message
      this.formData.message = `${this.formData.message} \n\n ${pr_url}`

      if (import.meta.env.PROD) {
        // send form to netlify only in production
        fetch(location.href, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: this.encode({'form-name': this.formName, ...this.formData})
        }).finally(() =>
          this.loading = false
        )
      } else {
        console.log(`NODE_ENV is ${import.meta.env.NODE_ENV}, no form submission is made to to netlify`)
        this.loading = false
      }
    },
    async createPR(prDescription) {
      const pr = await createAnonymousPR({
        botUserName: "the-nice-bot",
        botPersonalToken: import.meta.env.VITE_THE_NICE_BOT_SPEC,
        repoName: import.meta.env.VITE_REPO_NAME,
        upstreamOwner: import.meta.env.VITE_ORGANIZATION,
        upstreamTargetBranch: import.meta.env.VITE_BRANCH_NAME,
        filePath: "bnlc-.csv",
        base64data: Base64.encode(this.fileContent),
        prDescription: prDescription
      });

      this.$emit("prUrl", pr.data.html_url);
      return pr.data.html_url;
    }
  }
};
</script>


<style lang="scss" scoped>
.limited-width {
  max-width: 35em;
}
</style>
