# Vue + Express + MySQL SSR Blog

This is a Server-Side Rendered (SSR) blog system built with Vue 3, Express, and MySQL.

## Features

- **SSR**: Server-side rendering for Home and Article Detail pages for better SEO and performance.
- **CRUD**: Full Create, Read, Update, Delete operations for articles.
- **Database**: MySQL with Sequelize ORM.
- **AI Assistant**: Mock AI writing assistant in the Create Article page.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Database Configuration**:
    -   Ensure you have MySQL installed and running.
    -   Create a database named `blog_db` (or update `db/db.js`).
    -   Update `db/db.js` with your MySQL username and password.

3.  **Initialize Database**:
    ```bash
    node db/init.js
    ```
    This will create the tables and add some dummy data.

## Running the Project

### Development
```bash
npm run dev
```
Starts the Express server with Vite middleware at `http://localhost:3000`.

### Production
1.  Build the client and server bundles:
    ```bash
    npm run build
    ```
2.  Start the production server:
    ```bash
    npm run serve
    ```

## Project Structure

-   `src/`: Vue frontend source code.
    -   `pages/`: Vue components for pages.
    -   `router/`: Vue Router configuration.
    -   `entry-client.js`: Client-side entry point.
    -   `entry-server.js`: Server-side entry point.
-   `server.js`: Express server handling API and SSR.
-   `db/`: Database configuration and models.
