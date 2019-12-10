describe("Image compare", () => {
    it("should compare image from URL", () => {
        cy.visit("localhost:8080")
        cy.get("#sample").matchImage("sample")
    })

    it("should compare image from base64", () => {
        cy.visit("localhost:8080")
        cy.get("#sample2").matchImage("sample2")
    })
})