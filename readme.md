# cypress-image-compare

Cypress command package to compare images with simple pixel diff (pixelmatch). 
Supports PNG.

## Adding to project

Add following lines to your _commands.ts_:

```tsx
/// <reference types="cypress-image-compare" />

import "cypress-image-compare/commands";
```

## Usage

In the first run use **update** option to generate a snapshots.

```tsx
cy.get("#sample").matchImage("sample", { update: true });
```

After that just call.

```tsx
cy.get("#sample").matchImage("sample");
```
