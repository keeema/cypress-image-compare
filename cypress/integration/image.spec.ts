describe("Image compare", () => {
    it("should compare image", () => {
        cy.visit("localhost:8080")
        cy.get("#sample").matchImage("sample")
    })
})