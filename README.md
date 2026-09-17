# 🍽️ TasteTrail — Full-Stack Food Delivery Web Application

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

> **TasteTrail** is an end-to-end, full-stack food ordering and delivery web application built with a modern React + Vite frontend and a high-performance Spring Boot REST API backend. It features a curated 53-item commercial menu, seamless multi-category filtering, persistent dual-mode cart synchronization, robust JWT authentication, instant order placement, and real-time payment state transitions.

---

## ✨ Key Features

### 🍔 Interactive Menu & Commercial Photography
* **53 Curated Dishes:** Spanning 7 categories — *Burgers, Pizzas, Curries, Rice & Biryanis, Breads (Rotis/Naans), Royal Desserts, and Specials*.
* **Commercial-Grade Photography:** 100% locally served, high-resolution hero food photography styled for commercial food delivery platforms.
* **Instant Search & Filter:** Live search bar with real-time text matching across names and descriptions.
* **Dietary Toggle:** Dedicated "Pure Veg" toggle with authentic Indian green/red dietary markers.

### 🛒 Dual-Mode Persistent Shopping Cart
* **Guest & Authenticated Sync:** Seamlessly supports guest browsing; upon user login or registration, guest items automatically merge into the remote user cart on the backend.
* **Live Quantity Updates:** In-cart item increments, decrements, and total amount recalculations.
* **Automatic Cart Clearing:** Cart is automatically cleared both client-side and in the database upon successful checkout.

### 🔒 Enterprise Authentication & Security
* **JWT Authentication:** Stateless session management utilizing signed HMAC-SHA256 tokens.
* **Role-Based Access Control:** Differentiated security policies for `ROLE_CUSTOMER` and `ROLE_ADMIN`.
* **Automatic Session Restoration:** Preserves authenticated state across page refreshes via `localStorage` and custom Axios interceptors.

### 💳 Checkout, Payment Simulation & Order Lifecycle
* **Order Placement (`POST /orders/place`):** Converts active cart into an active order with user-specified delivery address and contact notes.
* **Payment State Simulation (`PUT /payments/{id}/status?status=SUCCESS`):** Transitions payment from `PENDING` to `SUCCESS`, triggering the backend order state transition from `PLACED` to `CONFIRMED`.
* **Order History Dashboard:** Real-time chronological tracking of all placed orders, item breakdowns, total paid amounts, and statuses.

---

## 🏗️ Architecture & Tech Stack

### Frontend
* **Core:** React 19, JavaScript (ES6+), HTML5, CSS3 (Modular & Custom Responsive Layouts)
* **Build Tool:** Vite 8.3
* **Routing:** React Router DOM 6
* **Icons:** Lucide React
* **HTTP Client:** Axios (with Bearer token request and 401 response interceptors)
* **Code Quality:** ESLint with zero warnings/errors

### Backend
* **Framework:** Spring Boot 4.x with Java 25 (Adoptium JDK)
* **Security:** Spring Security 6 (Stateless JWT Filter, BCrypt Password Encoder)
* **Persistence:** Spring Data JPA & Hibernate ORM
* **Database:** MySQL 8.0 (HikariCP connection pooling)
* **Build System:** Apache Maven 3.9 (via `mvnw`)

---

## 📁 Project Structure

```text
tastetrail/
├── tastetrail-frontend/
│   ├── public/
│   │   └── review_images/        # 53 High-resolution commercial food photographs
│   ├── src/
│   │   ├── components/           # Navbar, Footer, FoodCard, CategoryFilter, ProtectedRoute
│   │   ├── context/              # AuthContext (JWT/user session), CartContext (sync & state)
│   │   ├── pages/                # Home, Menu, Cart, Checkout, Orders, Login, Register, NotFound
│   │   ├── services/             # api.js (Axios), orderService.js, paymentService.js
│   │   ├── utils/                # foodImages.js (Exact ID and name image mapping)
│   │   ├── App.jsx               # Application routing and layout
│   │   └── main.jsx              # React entry point
│   ├── package.json
│   └── vite.config.js
│
└── tastetrail-backend/
    ├── src/main/java/tastetrail_backend/
    │   ├── config/               # SecurityConfig (JWT filter chain, CORS)
    │   ├── controller/           # UserController, CartController, OrderController, PaymentController, etc.
    │   ├── entity/               # User, MenuItem, Cart, CartItem, Order, OrderItem, Payment
    │   ├── repository/           # Spring Data JPA interfaces
    │   ├── security/             # JwtService, JwtAuthenticationFilter, CustomUserDetailsService
    │   └── service/              # Business logic services
    ├── pom.xml
    └── mvnw.cmd
```

---

## ⚙️ Environment Variables & Configuration

TasteTrail follows the **Twelve-Factor App** methodology for cloud-ready configuration. Sensitive parameters and hosting URLs are decoupled from source code and managed via environment variables.

### 🌐 Frontend Configuration (`tastetrail-frontend`)

| Variable | Default (Local) | Production Example | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | `https://tastetrail-api.onrender.com` | Base URL pointing to the Spring Boot REST API |

*For local overrides, copy `.env.example` to `.env` (automatically ignored by Git).*

### ☕ Backend Configuration (`tastetrail-backend`)

| Variable | Default (Local) | Production Example | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `8080` | `10000` (Assigned by Render) | Server listening port |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/taste_trail_db` | `jdbc:mysql://aiven-db-host:port/defaultdb?sslMode=REQUIRED` | JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | `root` | `avnadmin` | MySQL database user |
| `SPRING_DATASOURCE_PASSWORD` | *(empty)* | `your_cloud_db_password` | MySQL database user password |
| `JWT_SECRET` | *(empty)* | `[Base64 256-bit Key]` | Secret key used to sign and verify JWT authentication tokens |
| `JWT_EXPIRATION` | `86400000` (24 hours) | `86400000` | JWT expiration time in milliseconds |
| `FRONTEND_URL` | *(empty)* | `https://tastetrail-app.vercel.app` | Production frontend domain allowed in CORS configuration |

---

## 🚀 Quick Start Guide (Local Development)

### 1. Prerequisites
* **Node.js:** v18+ (tested on Node v24)
* **Java:** JDK 17+ (tested on Eclipse Adoptium JDK 25)
* **MySQL:** 8.0+ running on port `3306`

### 2. Backend Setup
1. Create local MySQL database:
   ```sql
   CREATE DATABASE taste_trail_db;
   ```
2. For local secrets, create `src/main/resources/application-local.properties` (this file is excluded from Git to prevent exposing credentials):
   ```properties
   spring.datasource.password=your_local_mysql_password
   jwt.secret=your_local_base64_jwt_secret_key
   ```
   *(Alternatively, export `SPRING_DATASOURCE_PASSWORD` and `JWT_SECRET` as environment variables).*
3. Build and launch the Spring Boot server:
   ```bash
   cd tastetrail-backend
   ./mvnw clean package -DskipTests
   java -jar target/tastetrail-backend-0.0.1-SNAPSHOT.jar
   ```
   *Backend starts at `http://localhost:8080`.*

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd tastetrail-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run ESLint and verify production build:
   ```bash
   npm run lint
   npm run build
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend is live at `http://localhost:5173`.*

---

## ☁️ Production Deployment Guide

### 1. Cloud Database (e.g., Aiven, TiDB Cloud, Railway)
1. Provision a free-tier managed MySQL instance.
2. Note the connection URI, database name, port, username, and password.
3. The application will automatically initialize tables on first boot (`spring.jpa.hibernate.ddl-auto=update`).

### 2. Backend Deployment (e.g., Render)
1. In Render, create a new **Web Service** connected to your GitHub repository.
2. **Root Directory:** `tastetrail-backend`
3. **Environment:** `Java` (or Docker with OpenJDK 17+)
4. **Build Command:** `./mvnw clean package -DskipTests`
5. **Start Command:** `java -jar target/tastetrail-backend-0.0.1-SNAPSHOT.jar`
6. Add Environment Variables in Render Dashboard:
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<host>:<port>/<dbname>?sslMode=REQUIRED`
   - `SPRING_DATASOURCE_USERNAME`: `<username>`
   - `SPRING_DATASOURCE_PASSWORD`: `<password>`
   - `JWT_SECRET`: `<your_base64_256_bit_secret>`
   - `FRONTEND_URL`: `https://your-frontend-app.vercel.app`

### 3. Frontend Deployment (e.g., Vercel)
1. In Vercel, import your GitHub repository.
2. **Root Directory:** Select `tastetrail-frontend`.
3. **Framework Preset:** `Vite`.
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. Add Environment Variable in Vercel:
   - `VITE_API_BASE_URL`: `https://your-backend-app.onrender.com`
7. **SPA Routing:** Single-page routing is pre-configured via `vercel.json` rewrites (`/(.*) -> /index.html`) so refreshing `/menu`, `/cart`, `/checkout`, or `/orders` works flawlessly without 404s.

### 4. How Frontend & Backend Connect
* **CORS Dynamic Origin:** The backend's `SecurityConfig.java` reads `FRONTEND_URL` from the environment and automatically permits requests from your Vercel domain, while keeping `http://localhost:5173` and `http://localhost:5174` active for local development.
* **Axios Base URL:** The frontend reads `import.meta.env.VITE_API_BASE_URL` at runtime. All API calls, authentication headers, and cookie/credential forwarding are directed to the live cloud backend.

---

## 🧪 Customer Journey Demo Flow

To demonstrate or record the project for portfolio/LinkedIn:

1. **Discovery:** Browse the landing page hero section, explore featured categories, and click **Explore Menu**.
2. **Catalog Browsing:** Filter by *Burgers*, *Pizzas*, *Desserts*, or toggle **Pure Veg**.
3. **Hero Dishes:** Check out item **#33 Dal Makhani (Mini)**, item **#36 Crispy Aloo Tikki Burger**, item **#13 Royal Kesar Phirni**, and item **#16 Ras Malai**.
4. **Cart Management:** Add dishes, increase quantities directly in the drawer or cart page, and observe real-time price recalculations.
5. **Checkout & Auth:** Sign in or register a new customer account (`Customer` role assigned automatically).
6. **Order Placement & Instant Payment:** Submit delivery address, select *UPI/Card/Cash*, and complete the payment simulation.
7. **Confirmation & Tracking:** Verify the instant confirmation receipt (`CONFIRMED` status, `SUCCESS` payment) and inspect the **Orders** dashboard.

---

## 📡 REST API Overview

| Method | Endpoint | Access / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/users` | **Public** | Register new customer account |
| `POST` | `/users/login` | **Public** | Authenticate credentials and obtain JWT |
| `GET` | `/users` | **Authenticated** | Fetch user profile data |
| `PUT` | `/users/{id}` | **Admin** (`ROLE_ADMIN`) | Update user details |
| `DELETE` | `/users/{id}` | **Admin** (`ROLE_ADMIN`) | Remove user account |
| `GET` | `/menu-items` | **Public / Auth** | Retrieve all dishes in the catalog |
| `GET` | `/menu-items/available` | **Public** | Retrieve all currently available dishes |
| `GET` | `/restaurants/active` | **Public** | Retrieve active restaurant listings |
| `GET` | `/cart` | **Customer** | Fetch current active user cart |
| `POST` | `/cart-items` | **Customer** | Add item to active shopping cart |
| `PUT` | `/cart-items/{id}` | **Customer** | Update quantity of a cart item |
| `DELETE` | `/cart-items/{id}` | **Customer** | Remove item from cart |
| `POST` | `/orders/place` | **Customer** | Convert active cart into placed order |
| `GET` | `/orders` | **Customer / Admin** | Fetch order history |
| `GET` | `/orders/{id}` | **Customer / Admin** | Retrieve specific order receipt by ID |
| `POST` | `/payments` | **Customer** | Initiate payment record for an order |
| `PUT` | `/payments/{id}/status` | **Customer / Admin** | Transition payment status (`SUCCESS` triggers `CONFIRMED`) |

---

## 🔮 Future Enhancements

* **Live Order Tracking:** WebSockets / STOMP integration for real-time kitchen preparation and delivery driver geolocation updates.
* **Payment Gateway Integration:** Direct Razorpay / Stripe webhook processing for live payment fulfillment.
* **Customer Reviews & Ratings:** User review submission system with verified-order badges.
* **Push Notifications:** Web Push notifications for order confirmation and dispatch alerts.
* **Multi-Restaurant Cart Handling:** Intelligent cart splitting for items ordered from multiple restaurant kitchens.

---

## 💼 Resume & LinkedIn Highlights

* **Full-Stack Engineering:** Developed a production-ready, full-stack food delivery application with React 19, Spring Boot, MySQL, and Spring Security.
* **Security & Access Control:** Implemented stateless JWT-based authentication with BCrypt password hashing, role-based authorization (`CUSTOMER` vs `ADMIN`), and automated token interceptors.
* **State Management & Persistence:** Built a fault-tolerant cart state manager that supports offline guest interactions and synchronizes seamlessly with MySQL upon authentication.
* **Clean Code & Robustness:** Maintained strict zero-error ESLint compliance, responsive layout architecture without layout shifts, and comprehensive API exception handling.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
