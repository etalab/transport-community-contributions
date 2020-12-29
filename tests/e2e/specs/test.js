// https://docs.cypress.io/api/introduction/api.html

describe('valid file upload', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
    cy.contains('h1', 'Proposer un ajout ou une modification à la base nationale de covoiturage')
  })
  it('upload a valid file', () => {
    const valid_db_fixture = 'valid-base-empty-lines.csv';
    cy.get('[data-cy="file-input"]').attachFile(valid_db_fixture);
    cy.get('[data-cy="is-file-valid"]').contains('Le fichier est valide')
    cy.get('[data-cy="request-modification-form"]').contains('Soumettre la demande de modification')
    cy.get('[data-cy="submit-button"]').contains('Envoyer')
  })
})

describe('upload invalid file', () => {
  it('Download the file', () => {
    const invalid_db_fixture = 'invalid-base.csv';
    cy.get('[data-cy="file-input"]').attachFile(invalid_db_fixture);
    cy.get('[data-cy="is-file-valid"]').contains('Le fichier n\'est pas valide')
    cy.get('[data-cy="request-modification-form"]').should('not.exist')
    cy.get('[data-cy="submit-button"]').should('not.exist')
  })
})