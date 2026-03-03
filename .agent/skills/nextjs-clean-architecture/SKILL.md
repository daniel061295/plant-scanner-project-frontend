---
name: nextjs-clean-architecture
description: Enforces Clean Architecture principles (Domain, Application, Infrastructure, Presentation), Screaming Architecture (feature-centric folder structure), and Clean Code rules (SOLID principles, DRY, KISS) for a Next.js App Router project. Use this skill when generating, parsing, or refactoring code in Next.js projects to ensure the architecture remains scalable, maintainable, and independent of external frameworks.
---

# Next.js Clean Architecture Guidelines

This skill defines the technical standards and architectural patterns for Next.js App Router projects. You must adhere strictly to these rules whenever you are tasked with writing new features, refactoring existing code, or addressing bugs.

## Core Principles

1.  **Clean Architecture:**
    *   **Domain Layer:** Enterprise business rules. Contains Entities and Domain Services. MUST NOT depend on *anything* else (no React, no Next.js, no DBORM imports).
    *   **Application Layer:** Application business rules (Use Cases). Orchestrates the flow of data but contains no UI logic. Depends only on the Domain Layer. Defines interfaces (ports) for external dependencies (repositories, gateways).
    *   **Infrastructure Layer:** Implementations for external systems (Database, APIs, third-party services). Implements interfaces defined in the Application layer.
    *   **Presentation Layer:** React components, Next.js Server Actions, Route Handlers, Pages, and Layouts. Depends on the Application layer to execute use cases.

2.  **Screaming Architecture:**
    *   The project structure should loudly declare the *business domain*, not the framework.
    *   Organize code by **Feature** rather than strictly by technical role, while maintaining layer separation within the feature.

3.  **Clean Code (SOLID):**
    *   **SRP (Single Responsibility Principle):** A class/function should have one and only one reason to change.
    *   **OCP (Open/Closed Principle):** Software entities should be open for extension but closed for modification.
    *   **LSP (Liskov Substitution Principle):** Derived classes must be substitutable for their base classes.
    *   **ISP (Interface Segregation Principle):** Do not force clients to depend on interfaces they do not use.
    *   **DIP (Dependency Inversion Principle):** High-level modules should not depend on low-level modules. Both should depend on abstractions (interfaces).

## Folder Structure

The project MUST follow this feature-centric structure under the Next.js `src` directory:

```
src/
├── app/                  # Next.js App Router (Presentation Layer - Routing & Entry Points)
│   ├── (auth)/           # Route groups related to specific domains
│   ├── api/              # Route handlers (if applicable)
│   ├── layout.tsx
│   └── page.tsx
├── core/                 # Shared cross-cutting concerns for the enterprise
│   ├── domain/           # Core enterprise logic (Value Objects, Base Entities)
│   ├── errors/           # Custom error definitions
│   └── di/               # Dependency Injection container/setup
├── features/             # Business Features (Screaming Architecture)
│   └── [feature-name]/   # Example: 'users', 'orders', 'products'
│       ├── domain/       # Feature-specific Domain Layer
│       │   ├── entities/ # Business objects
│       │   └── ports/    # Repository interfaces
│       ├── application/  # Feature-specific Application Layer
│       │   ├── use-cases/# Application logic (createOrder, getUser)
│       │   └── dtos/     # Data Transfer Objects
│       ├── infrastructure/# Feature-specific Infrastructure Layer
│       │   ├── actions/  # Next.js Server Actions (Adapter for Presentation)
│       │   ├── repositories/ # Repository Implementations (e.g., Prisma, Drizzle)
│       │   └── mappers/  # Entity <-> DTO <-> DB model conversions
│       └── presentation/ # Feature-specific UI Components
│           ├── components/
│           └── hooks/
└── lib/                  # Application-wide utilities (e.g., specialized formatters)
```

## detailed Implementation Rules

### 1. The Domain Layer (`features/[feature]/domain/`)
*   **Entities:** Must be pure TypeScript classes or types. They encapsulate core business state and rules validation.
*   **Ports:** Define interfaces for anything that requires I/O. For example, `IUserRepository`.
*   **Prohibitions:** You CANNOT import `react`, `next`, `prisma`, `axios`, or any other infrastructure/framework libraries here.

### 2. The Application Layer (`features/[feature]/application/`)
*   **Use Cases (Interactors):** Must implement specific application logic. A use case class or function receives input (DTOs), uses domain entities to apply business rules, and interacts with infrastructure via interfaces (ports).
*   **DTOs:** Use Data Transfer Objects for passing data in and out of use cases to decouple the application layer from external data formats.
*   **Prohibitions:** You CANNOT import `react` or `next` APIs here (e.g., no `cookies()`, no `headers()`).

### 3. The Infrastructure Layer (`features/[feature]/infrastructure/`)
*   **Repositories:** Classes that implement the domain ports. This is where you write SQL queries or ORM calls (e.g., Prisma).
*   **Server Actions:** Serve as Controllers/Adapters inside the Next.js ecosystem. They receive HTTP requests (or Next.js action invocations), unpack the data, invoke the Application use case, and return the result.
*   **Mappers:** Always map Database Models to Domain Entities before returning them from repositories. Never leak DB models (like Prisma generated types) into the Application or Domain layers.

### 4. The Presentation Layer (`features/[feature]/presentation/` & `app/`)
*   **Components:** Keep React components dumb. They should receive data as props and emit events via callbacks.
*   **Server Components vs Client Components:** Maximize the use of React Server Components (RSC) under `app/`. Only use `"use client"` when necessary for interactivity (hooks, event listeners) inside `presentation/components/`.
*   **Data Fetching:** Fetch data in Server Components or Server Actions by calling the appropriate Use Case (or directly calling a repository if it's a simple read operation that bypasses complex application logic, though Use Cases are preferred for consistency).

## Dependency Injection (DI) Example

To respect the Dependency Inversion Principle, Use Cases should receive their dependencies. In Next.js, you can manually compose these or use a lightweight DI tool.

```typescript
// features/users/infrastructure/di.ts

import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { PrismaUserRepository } from './repositories/prisma-user.repository';

// Simple manual DI factory
export function getCreateUserUseCase() {
  const userRepository = new PrismaUserRepository(); // Implements IUserRepository
  return new CreateUserUseCase(userRepository);
}
```

Then, inside your Server Action or Route Handler:

```typescript
// features/users/infrastructure/actions/user.actions.ts
"use server"

import { getCreateUserUseCase } from '../di';

export async function createUserAction(data: CreateUserDTO) {
  const useCase = getCreateUserUseCase();
  return await useCase.execute(data);
}
```

## Enforcement Checklist
When reviewing or writing code, ensure:
1. [ ] No UI code (`React`) exists outside Presentation.
2. [ ] No Database specific types (`Prisma.User`) exist outside Infrastructure.
3. [ ] Directory structure aligns with features (e.g., `features/orders/`).
4. [ ] All external dependencies are abstracted behind interfaces (Ports) defined in the Domain.
5. [ ] Components only call Server Actions or Use Cases, never the Database directly.
