import App from './App.vue'

describe('valid file upload', () => {
  it('page renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(App)
    cy.contains('h1', 'Proposer un ajout ou une modification à la base nationale de covoiturage')
  })
  it('upload a valid file', () => {
    cy.mount(App)
    // mock the existing base content
    cy.intercept('https://raw.githubusercontent.com/*', {
      statusCode: 200,
      body: "",
    })
    cy.get('[data-cy="file-input"]').selectFile('cypress/fixtures/valid-base-empty-lines.csv');
    // makes a real request to validata api, could be mocked
    cy.get('[data-cy="is-file-valid"]').contains('Le fichier est valide')
    cy.get('[data-cy="request-modification-form"]').contains('Soumettre la demande de modification')
    cy.get('[data-cy="submit-button"]').contains('Envoyer')
  })
})

describe('invalid file upload', () => {
  it('Downloads the file', () => {
    cy.mount(App)
    cy.intercept('https://raw.githubusercontent.com/*', {
      statusCode: 200,
      body: "",
    })
    cy.get('[data-cy="file-input"]').selectFile('cypress/fixtures/invalid-base.csv');
    // Makes a real request to Validata API, could be mocked
    cy.get('[data-cy="is-file-valid"]').contains('Le fichier n\'est pas valide')
    cy.get('[data-cy="request-modification-form"]').should('not.exist')
    cy.get('[data-cy="submit-button"]').should('not.exist')
  })
})

describe('test the map', () => {
  it('checks the map exists', () => {
    cy.mount(App)
    cy.intercept('https://raw.githubusercontent.com/*', {
      statusCode: 200,
      body: "",
    })
    cy.get('[data-cy="file-input"]').selectFile('cypress/fixtures/valid-base-empty-lines.csv');
    cy.get('[data-cy="show-the-map-link"]').contains('Voir la carte')
    cy.get('[data-cy="map"]').should('not.exist')
    cy.get('[data-cy="show-the-map-link"]').click()
    cy.get('[data-cy="map"]').find('path.leaflet-interactive').should('have.length', 1)
  })
})
