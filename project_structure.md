# Online Book Store Web Application - Project Structure

This document provides a comprehensive overview of the file structure for the Online Book Store web application, a full-stack project with a Spring Boot backend and vanilla JavaScript frontend.

## 📁 Root Directory
```
📦 Online_Book_Store-Web-App/
├── 📁 backend/                                              # Spring Boot REST API backend
├── 📁 frontend/                                             # Vanilla HTML/CSS/JS frontend
└── 📁 .git/                                                 # Git version control directory
```

## 🖥️ Backend (Spring Boot Application)

### 📁 backend/OnlineBookStore/
```
📦 OnlineBookStore/ (Spring Boot Application Root)
├── 📄 pom.xml                    # Maven project configuration and dependencies
├── 📄 mvnw                       # Maven wrapper script for Unix/Linux
├── 📄 mvnw.cmd                   # Maven wrapper batch file for Windows
├── 📄 .gitignore                 # Git ignore rules for backend
├── 📄 .gitattributes             # Git attributes configuration
├── 📁 .mvn/                      # Maven wrapper configuration directory
├── 📁 src/                       # Source code directory
├── 📁 target/                    # Maven build output directory (compiled classes, JARs)
└── 📁 uploads/                   # Uploaded files are saved here
```

### 📁 src/main/java/com/project/OnlineBookStore/
```
📦 Java Source Code (Main Application Package)
├── 📄 OnlineBookStoreApplication.java    # Spring Boot main application class with @SpringBootApplication
├── 📁 config/                            # Configuration classes directory
│   ├── 📄 AppConfig.java                 # General application configuration (CORS, beans)
│   ├── 📄 GlobalExceptionHandler.java    # Global exception handling and error responses
│   ├── 📄 JwtAuthenticationFilter.java   # JWT token authentication filter for requests
│   └── 📄 SecurityConfig.java            # Spring Security configuration (authentication, authorization)
├── 📁 controller/                        # REST API controllers directory
│   ├── 📄 AuthController.java            # Authentication endpoints (login, register, logout)
│   ├── 📄 MaterialController.java        # Book/material management endpoints (CRUD operations)
│   ├── 📄 PurchaseController.java        # Purchase/order management endpoints (buy, history)
│   └── 📄 UserController.java            # User management endpoints (profile, user operations)
├── 📁 dto/                               # Data Transfer Objects directory
│   ├── 📄 LoginRequest.java              # DTO for login request payload
│   ├── 📄 MaterialDTO.java               # DTO for material/book data transfer
│   ├── 📄 PurchaseDTO.java               # DTO for purchase/order data transfer
│   └── 📄 RegisterRequest.java           # DTO for user registration payload
├── 📁 example/                           # Example usage and demonstration directory
│   └── 📄 PurchaseAPIUsageExample.java   # Example code demonstrating Purchase API usage
├── 📁 init/                              # Application initialization directory
│   └── 📄 DataInitializer.java           # Database initialization and default data setup
├── 📁 model/                             # JPA entity classes directory
│   ├── 📄 Material.java                  # Material/book entity with JPA annotations
│   ├── 📄 Purchase.java                  # Purchase/order entity with JPA annotations
│   ├── 📄 PurchaseStatus.java            # Enum for purchase status (PENDING, COMPLETED, etc.)
│   ├── 📄 Role.java                      # Enum for user roles (USER, ADMIN)
│   └── 📄 User.java                      # User entity with JPA annotations
├── 📁 repository/                        # Data access layer directory
│   ├── 📄 MaterialRepository.java        # JPA repository interface for Material operations
│   ├── 📄 PurchaseRepository.java        # JPA repository interface for Purchase operations
│   └── 📄 UserRepository.java            # JPA repository interface for User operations
├── 📁 service/                           # Business logic layer directory
│   ├── 📄 CustomUserDetailsService.java  # Spring Security UserDetailsService implementation
│   ├── 📄 DTOConversionService.java      # Service for converting between DTOs and entities
│   ├── 📄 FileStorageService.java        # Service for file upload/storage operations
│   ├── 📄 MaterialService.java           # Business logic for material/book operations
│   └── 📄 PurchaseService.java           # Business logic for purchase/order operations
└── 📁 util/                              # Utility classes directory
    └── 📄 JwtUtil.java                   # JWT token utility methods (generation, validation)
```

### 📁 src/main/resources/
```
📦 Application Resources
└── 📄 application.properties    # Spring Boot configuration (database, server, file settings)
```

### 📁 src/test/java/com/project/OnlineBookStore/
```
📦 Test Classes
└── 📄 OnlineBookStoreApplicationTests.java    # Spring Boot integration tests
```

### 📁 target/ (Build Output)
```
📦 Maven Build Directory
├── 📁 classes/                              # Compiled Java classes
│   ├── 📄 application.properties            # Copied resource files
│   └── 📁 com/project/OnlineBookStore/      # Compiled .class files mirror src structure
├── 📁 generated-sources/                    # Maven generated source files
├── 📁 generated-test-sources/               # Maven generated test source files
├── 📁 maven-status/                         # Maven build status and file listings
└── 📁 test-classes/                         # Compiled test classes
```

## 🌐 Frontend (Client-Side Web Application)

### 📁 frontend/
```
📦 Frontend Application Root
├── 📄 index.html           # Main homepage/landing page
├── 📁 assets/              # Static assets directory
│   ├── 📁 css/             # Stylesheets directory
│   │   ├── 📄 base.css         # Base/reset styles and common utilities
│   │   ├── 📄 variables.css    # CSS custom properties and theme variables
│   │   ├── 📄 homepage.css     # Styles specific to the homepage
│   │   └── 📄 auth.css         # Styles for authentication pages (login/register)
│   ├── 📁 js/              # JavaScript files directory
│   │   ├── 📄 main.js          # Main application JavaScript and homepage logic
│   │   └── 📄 auth.js          # Authentication-related JavaScript (login/register)
│   └── 📁 images/          # Image assets directory
│       ├── 📄 logo.png         # Application logo
│       ├── 📄 books.jpg        # Book-related imagery
│       └── 📄 Welcome.jpg      # Welcome/hero section image
└── 📁 pages/               # Additional HTML pages directory
    └── 📄 login.html           # Login/authentication page
```


## 📋 Key Technologies & Architecture

### Backend Stack:
- **Spring Boot 3.x** - Main framework for REST API
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database abstraction layer
- **MySQL** - Relational database (via MySQL Connector)
- **Maven** - Build tool and dependency management
- **BCrypt** - Password encryption

### Frontend Stack:
- **Vanilla HTML5** - Markup structure
- **CSS3** - Styling with custom properties
- **Vanilla JavaScript** - Client-side interactivity
- **Fetch API** - HTTP requests to backend

### Architecture Pattern:
- **MVC (Model-View-Controller)** - Separation of concerns
- **RESTful API** - HTTP-based web services
- **Session-based Authentication** - Server-side session management
- **Role-based Access Control** - USER and ADMIN roles

This project follows standard Spring Boot conventions and Maven directory structure, making it easy to understand and maintain for developers familiar with Java web development.