# Growatt Server

A robust TypeScript backend service designed to interact with Growatt solar monitoring servers. This project provides a centralized API for accessing plant data, device information, historical metrics, weather updates, and fault logs from Growatt's monitoring platform. Built with Express.js, it offers a secure and efficient way to integrate Growatt data into your applications, utilizing PostgreSQL for data persistence and Drizzle ORM for database interactions.

---

## 🚀 Key Features & Benefits

This server aims to simplify and centralize access to your Growatt solar data with the following features:

*   🔐 **Authentication**: Secure login/logout mechanisms with session management for Growatt and the API itself.
*   🌱 **Plant Management**: Retrieve lists of all registered plants and detailed information for specific plants.
*   📊 **Device Data**: Access real-time and historical data for various devices within your solar plants.
*   📈 **Historical Data**: Fetch historical power generation, consumption, and other metrics.
*   ☀️ **Weather Information**: Integrate weather data relevant to your plant locations.
*   🚨 **Fault Logs**: Access and manage fault and error logs from your Growatt devices.
*   📦 **Containerized Deployment**: Easily deployable with Docker and Docker Compose.
*   💾 **Persistent Storage**: Utilizes PostgreSQL for storing configuration and potentially cached data.
*   📝 **API Documentation**: Built-in Swagger/OpenAPI documentation for easy API exploration.

---

## 🛠️ Technologies

### Languages

*   **TypeScript**: Ensures type safety and improves code maintainability.
*   **JavaScript**: The underlying language for Node.js.

### Frameworks & Runtimes

*   **Node.js**: Asynchronous event-driven JavaScript runtime for scalable network applications.
*   **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
*   **Bun**: A fast all-in-one JavaScript runtime for development and execution.

### Tools & Technologies

*   **Docker**: Containerization platform for consistent development and deployment environments.
*   **Drizzle ORM**: A modern TypeScript ORM for interacting with PostgreSQL.
*   **PostgreSQL**: A powerful, open-source object-relational database system.
*   **Redis**: In-memory data store, used for caching or session management (inferred from `REDIS_URL`).

---

## 📋 Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

*   **Node.js**: `v18.x` or higher (recommended).
*   **Bun**: `v1.x` or higher (for running scripts efficiently).
*   **Docker & Docker Compose**: For containerized setup.
*   **PostgreSQL**: If running the database directly, otherwise Docker handles it.

---

## ⚙️ Installation & Setup Instructions

There are two primary ways to set up and run the `growatt-server`: using Docker Compose (recommended) or manually.

### Option 1: Using Docker Compose (Recommended)

This method sets up the Node.js application, a PostgreSQL database, and Redis (if configured) with a single command.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/iddhis-sulakshana/growatt-server.git
    cd growatt-server/backend # Navigate to the backend directory
    ```
2.  **Configure Environment Variables:**
    Create a `.env` file in the `backend/` directory by copying `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file with your Growatt credentials and other configurations (see [Configuration Options](#-configuration-options)).
    Ensure `DATABASE_URL` matches the service name in `docker-compose.yml` (e.g., `postgres://user:password@db:5432/growattdb`).

3.  **Start Services:**
    Build and run all services in detached mode:
    ```bash
    docker-compose up --build -d
    ```
    This will start the `growatt-server` backend and its dependent services.

4.  **Run Database Migrations:**
    Once the services are up, run the Drizzle migrations to set up your database schema:
    ```bash
    docker-compose exec app bun run db:migrate
    ```

5.  **Verify Setup:**
    Check the logs to ensure everything is running correctly:
    ```bash
    docker-compose logs -f app
    ```
    The server should be accessible at `http://localhost:<PORT>` (default `3000`).

### Option 2: Manual Setup

If you prefer to run the server directly on your host machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/iddhis-sulakshana/growatt-server.git
    cd growatt-server/backend # Navigate to the backend directory
    ```
2.  **Install Dependencies:**
    Use Bun to install the project dependencies:
    ```bash
    bun install
    ```
3.  **Configure Environment Variables:**
    Create a `.env` file by copying `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file with your Growatt credentials, database connection string, and other configurations.
    Make sure your `DATABASE_URL` points to a running PostgreSQL instance.
4.  **Set up Database:**
    *   **Generate Migrations:**
        ```bash
        bun run db:generate
        ```
    *   **Apply Migrations:**
        ```bash
        bun run db:migrate
        ```
        (Alternatively, you can `db:push` for development convenience)
5.  **Run the Server:**
    *   **Development Mode (with watch):**
        ```bash
        bun run dev
        ```
    *   **Production Mode:**
        ```bash
        bun run start
        ```
    The server will start on the configured `PORT`.

---

## 💡 Usage Examples & API Documentation

Once the server is running, you can interact with its API.

### API Documentation

The server provides interactive API documentation using Swagger UI.
Access it by navigating to: `http://localhost:<PORT>/api-docs` (replace `<PORT>` with your configured port, default `3000`).

### Basic API Interaction (Example)

After authenticating, you might perform requests like:

*   **Get Plant List:**
    `GET /api/plants`
*   **Get Plant Details:**
    `GET /api/plants/:plantId`
*   **Get Device Data:**
    `GET /api/plants/:plantId/devices/:deviceId/data`

Please refer to the Swagger UI for the complete list of available endpoints, request/response schemas, and authentication methods.

---

## 🔒 Configuration Options

The server uses environment variables for configuration. A `.env.example` file is provided, which you should copy to `.env` and fill in your specific values.

| Environment Variable   | Description                                                               | Example                                   |
| :--------------------- | :------------------------------------------------------------------------ | :---------------------------------------- |
| `GROWATT_USERNAME`     | Your Growatt monitoring platform username.                                | `your_growatt_username`                   |
| `GROWATT_PASSWORD`     | Your Growatt monitoring platform password.                                | `your_growatt_password`                   |
| `GROWATT_SERVER`       | The base URL of the Growatt monitoring API.                               | `https://server.growatt.com`              |
| `REDIS_URL`            | URL for the Redis server (e.g., for session management or caching).       | `redis://localhost:6379`                  |
| `DATABASE_URL`         | Connection string for the PostgreSQL database.                            | `postgresql://user:pass@host:5432/dbname` |
| `NODE_ENV`             | Application environment (`development` or `production`).                  | `development`                             |
| `PORT`                 | The port on which the Express server will listen.                         | `3000`                                    |
| `ADMIN_PASSWORD`       | Password for administrative API access (if applicable).                   | `super_secure_admin_password`             |
| `JWT_SECRET`           | Secret key for signing JWTs (must be at least 32 characters long).        | `a_very_secret_key_for_jwt_tokens_12345`  |

---

## 🤝 Contributing Guidelines

We welcome contributions to the `growatt-server`! If you'd like to contribute, please follow these guidelines:

1.  **Fork the repository** and clone it to your local machine.
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-description`.
3.  **Make your changes**, ensuring they adhere to the existing code style.
4.  **Write clear, concise commit messages.**
5.  **Test your changes** thoroughly.
6.  **Push your branch** to your forked repository.
7.  **Open a Pull Request** to the `main` branch of the original repository, describing your changes and their benefits.

---

## 📄 License Information

This project is currently **unlicensed**. Please contact the repository owner for licensing details regarding its use and distribution.

---

## 🙏 Acknowledgments

*   Thanks to the Growatt team for providing a platform for solar monitoring.
*   Special thanks to the developers of Express.js, TypeScript, Drizzle ORM, and Docker for their excellent tools.
