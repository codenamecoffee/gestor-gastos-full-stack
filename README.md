# GestorGastos FullStack 💰

**GestorGastos** is a personal finance management application designed as both a learning journey and a practical tool.  

It allows users to record, analyze, and visualize their financial transactions (income and expenses) through a modular system of widgets.

This project is my **full stack portfolio application**, built to showcase a complete software architecture using **ASP.NET Core 8**, **Entity Framework Core**, **SQL Server**, and **Angular**.

<br>

## 🎬 Demo(s)

> Below are brief demonstrations of the main features available in the currently implemented Transactions Widget. \
( _Additional widgets and functionalities are planned for future milestones._ )

<br>

| Feature                        | Demo GIF                                      |
|--------------------------------|-----------------------------------------------|
| **Drag & Resize Widget**       | ![Drag and Resize](./docs/demo-drag-resize.gif) |
| **Create a New Transaction**   | ![Create Transaction](./docs/demo-create-transaction.gif) |
| **Edit a Transaction**         | ![Edit Transaction](./docs/demo-edit-transaction.gif) |
| **Delete a Transaction**       | ![Delete Transaction](./docs/demo-delete-transaction.gif) |
| **Filter by Category or Date** | ![Filter Transactions](./docs/demo-filter.gif) |

<br>

## ⚙️ Tech Stack

**Backend**
- ASP.NET Core 8 (C#)
- Entity Framework Core
- SQL Server (local instance)
- RESTful API architecture

**Frontend**
- Angular 17
- TypeScript, SCSS
- Modular widget-based UI
- Visual Studio Code

**Development Tools**
- Visual Studio (for backend)
- Visual Studio Code (for frontend)
- Git & GitHub (SSH)
- GitHub Projects (Kanban & roadmap)
- Git branching workflow (`main`, `develop`, `feature/*`, `bugfix/*`)

**Deployment**
- Docker (soon)

**Security**
- JWT (soon)

<br>

## 🏗️ Architecture Overview

The system follows a **three-layered architecture**:

```
[Angular SPA] <---> [ASP.NET Core Web API] <---> [SQL Server]
      |                   |                        |
 Presentation       Business logic          Data persistance
```

- **Frontend:** Manages UI components and user interactions.
- **Backend:** Handles business logic, data validation, and transaction processing.
- **Database:** Stores transaction records, categories, and related metadata.

<br>

## 📁 Project Structure

```
GestorGastos_FullStack/
│
├─ GestorGastosApi/
│  ├── GestorGastosAPI.sln                # Visual Studio solution file for backend
│  └── GestorGastosApi/                   # Backend (ASP.NET Core Web API)
│      ├── Controllers/                   # API endpoints: handle HTTP requests and responses
│      ├── Data/                          # Database context and configuration (EF Core)
│      ├── DTOs/                          # Data Transfer Objects for API communication
│      ├── Migrations/                    # Database migration files (EF Core)
│      ├── Models/                        # Domain models/entities representing business data
│      ├── Properties/                    # Project properties and launch settings
│      ├── Services/                      # Business logic and reusable backend services
│      ├── Utils/                         # Utility classes and helpers
│      ├── appsettings.Development.json   # Development environment configuration
│      ├── appsettings.json               # Main application configuration
│      ├── GestorGastosAPI.csproj         # Project file for build and dependencies
│      ├── GestorGastosAPI.csproj.user    # User-specific project settings
│      ├── GestorGastosAPI.http           # HTTP request samples for API testing
│      └── Program.cs                     # Application entry point and startup configuration
│
├── gestor-gastos-app/                # Frontend (Angular)
│   ├── src/                          # Main source code (components, services, etc.)
│   ├── angular.json                  # Angular CLI configuration
│   ├── package.json                  # Node.js dependencies and scripts
│   └── tsconfig.json                 # TypeScript configuration
│
├── .gitignore                        # Git ignore rules for files/folders
├── LICENSE                           # Project license
└── README.md                         # Project documentation
```

<br>

## 🧩 Current Features

✅ Modular **Widget System** (e.g., `TransactionsWidget`)  
✅ CRUD operations for transactions (Create, Read, Update, Delete)  
✅ Dynamic filtering by category and date  
✅ SCSS-based responsive design  
✅ API communication via HTTP services  
✅ Modularized and maintainable code structure  

<br>

## 🚀 Running the Project

### Backend (ASP.NET Core API)
```bash
cd GestorGastosAPI\GestorGastosAPI
dotnet restore
dotnet run  // Please read the "Important Configuration Note" below first.
```

### Frontend (Angular App)
```bash
cd gestor-gastos-app
npm install
ng serve
```
> Then open http://localhost:4200
 in your browser.

<br>

## ⚠️ Important Configuration Note

**Warning**: The backend connection string is currently hardcoded in [**appsettings.json**](./GestorGastosAPI/GestorGastosAPI/appsettings.json) to connect to a local SQL Server instance using Entity Framework Core.

Anyone cloning this repository must <i>**update it manually**</i> to match their own database setup.

> **Note:**  
> The project is currently configured for SQL Server, but Entity Framework Core supports other database providers (e.g., SQLite, PostgreSQL, MySQL).  
> To use a different database, you must:
> - Install the appropriate EF Core provider package
> - Update the connection string and `DbContext` configuration in the code

<br>

---
<br>

**When running the backend setup commands:**

These commands (`dotnet restore` and `dotnet run `) restore dependencies and start the local API server.

The project will compile successfully, but if the database specified in
`appsettings.json` does not exist or cannot be reached, runtime errors may occur.

Make sure to:
- Have SQL Server (or your chosen database) running locally
- Update the connection string in `appsettings.json` to match your setup
- Or temporarily comment out the database context initialization for testing purposes

<br>

However, **future versions** will include:
- Environment-specific configuration files
- Secure connection string handling
- Docker-based setup for consistent environments

<br>

## 🧭 Roadmap & Project Management

> Development progress is managed through a [GitHub Project Board](https://github.com/users/codenamecoffee/projects/1/views/2),
organized under a **Kanban workflow** (Backlog → To Do (Current Sprint) → In Progress → Review/QA → Done).
> Complementarily, [GitHub Milestones](https://github.com/codenamecoffee/gestor-gastos-full-stack/milestones?sort=due_date&direction=asc)
define the **project’s strategic goals** over short, medium, and long-term phases.


### 🔹[Milestone 1](https://github.com/codenamecoffee/gestor-gastos-full-stack/milestone/1) : Short-Term Goals (next 2 weeks)

* 🧩 Implement Main Component — Corkboard
  - Foundation of the visual interface where all widgets will live.
  - Includes positioning and dynamic interaction for TransactionWidget.

<br>

* 🎨 UI & UX Enhancements
  - Refine initial TransactionWidget style.
  - Add day/night theme and improve general polish.
  - Add loading indicators, animations, and feedback for a smoother user experience.

<br>

* ⚙️ Code Quality Improvements
  - Add linters and formatters to standardize frontend and backend code.
  - Translate codebase comments and identifiers to English.

<br>

* 🧾 Form Validation (Frontend)
  - Add validation logic for creation and edit forms.
  - Include character counters and input constraints aligned with backend validation.

<br>

* 🧱 API Enhancements
  - Add HTTP status codes to all API endpoints.
  - Make database connection configurable for external users.
  - Add documentation for database setup and environment configuration.

<br>

---

### 🔹[Milestone 2](https://github.com/codenamecoffee/gestor-gastos-full-stack/milestone/2) : Medium-Term Goals (next 4 weeks)

* 🧰 Widget System Expansion
  - Implement multiple interactive widgets:
    - AnalysisWidget
    - NotesWidget
    - CalendarWidget
    - EmotionAnalysisWidget
    - FuturePurchasesWidget

  - Add buttons to add/remove widgets from the Corkboard.

<br>

* 🔐 User Authentication
  - Implement user accounts and JWT-based authentication.

<br>

* 🐳 Docker Deployment
  - Configure Docker Compose for backend services.
  - Deploy a functional frontend demo to demonstrate full-stack capabilities.

<br>

<br>

* 💾 Automated Testing
  - Begin implementing unit and integration tests for backend logic.

<br>

---

### 🔹[Milestone 3](https://github.com/codenamecoffee/gestor-gastos-full-stack/milestone/3) : Long-Term Goals (next 2 months)

- 🤖 AI-Enhanced Features
    - Transaction recording via camera + AI (optical and contextual recognition).
    - Emotion analysis widgets and playful AI-generated messages.
    - Smart financial assistant for insights and saving recommendations.

- 💡 Advanced Data Management
    - Implement system for breaking down transactions by item/service.
    - Add "Salary" and "Savings" entities for real financial flow tracking.
    - Intelligent layout engine and snap-to-grid positioning for widgets.

- 🔔 Notification System
    - Integration with WhatsApp/email for reminders of due payments or recurring transactions.

- 📈 Advanced Analytics
    - Export reports to PDF.
    - Integrate a real data analysis dashboard with charts and visual summaries.

<br>

## 💡 Project Vision

GestorGastos began as a personal tool to monitor and optimize daily expenses,
and has since evolved into a full-stack development learning platform.

> The long-term vision is to create a <i>**modular personal dashboard**</i> — a “digital corkboard”
that integrates financial tracking, habit monitoring, and productivity widgets powered by data analysis and intelligent automation.

<br>

## ✅ Highlights:

This **roadmap** and **vision** reflect both near-term development goals and long-term technical ambitions,
showcasing the project’s evolution toward a professional, scalable, and data-driven application.

<br>

 ## 👨‍💻 Author

> **Federico González Lage** —
Full Stack Developer in training | .NET & Angular Enthusiast
- [GitHub Profile](https://github.com/codenamecoffee)
- [LinkedIn](https://www.linkedin.com/in/fglmr95/)

<br>

## 🧾 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE)
 file for details.

 <br>

## 🛠️ Useful Links

- [GitHub Milestones](https://github.com/codenamecoffee/gestor-gastos-full-stack/milestones?sort=due_date&direction=asc)
- [GitHub Project Board](https://github.com/users/codenamecoffee/projects/1/views/2)
- [Repository](https://github.com/codenamecoffee/gestor-gastos-full-stack)