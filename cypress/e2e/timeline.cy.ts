describe('Timeline Page', () => {
  it('should Login', () => {
    cy.visit('/');
    cy.get('button').click();
    cy.get('#loginName').type('newbie@smartive.zitadel.cloud');
    cy.get('#submit-button').click();
    cy.get('#password').type('Noob-123');
    cy.get('#submit-button').click();
  });
});
