describe('Timeline Page', () => {
  it('should Login', () => {
    cy.session('test', () => {
      cy.visit('/');
      cy.wait(5000);
      cy.get('button').click();
      cy.origin('https://cas-fee-advanced-ocvdad.zitadel.cloud', () => {
        cy.get('#loginName').type('newbie@smartive.zitadel.cloud');
        cy.get('#submit-button').click();
        cy.get('#password').type('Noob-123');
        cy.get('#submit-button').click();
      });
      cy.url({ timeout: 10000 }).should('include', 'localhost:3000');
    });
  });
});
