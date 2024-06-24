# Project Setup

This README provides instructions on setting up a PostgreSQL database using Docker, Docker Compose, and includes useful Prisma commands for managing your ORM layer.

## Prerequisites

Before you can run the PostgreSQL container and use Prisma, you need to install Docker and Node.js.

### Installing Docker

- **For Mac**: Visit [Docker for Mac](https://docs.docker.com/desktop/mac/install/) and follow the instructions to download and install Docker Desktop for Mac.
- **For Windows**: Visit [Docker for Windows](https://docs.docker.com/desktop/windows/install/) and follow the instructions to download and install Docker Desktop for Windows.

### Installing Node.js

- Download and install Node.js from [Node.js official website](https://nodejs.org/).

## Running the PostgreSQL Container

Once Docker is installed, use Docker Compose to manage your PostgreSQL container.

1. **Start the container**:
   Navigate to the directory containing your `docker-compose.yml` file and run:

   ```bash
   docker-compose up -d
   ```

2. **Stop the container**:
   To stop the container, use:
   ```bash
   docker-compose down
   ```

## Accessing the Database

You can access the PostgreSQL database in several ways:

### Using `psql` Command Line Tool

1. **Accessing through Docker Exec**:

   ```bash
   docker exec -it mdms-postgres psql -U postgres -d development
   ```

2. **Using a GUI Tool**:
   Configure your connection with the following settings:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: `postgres`
   - **Database**: `mdms-development`

## Useful Prisma Commands

Prisma is an ORM that you use to manage your application's database. Here are some useful commands:

### `npx prisma init`

- Initializes a new Prisma project by creating the necessary configuration files.

### `npx prisma migrate dev`

- Creates new migrations based on changes in your Prisma schema, applies them to the database, and generates artifacts (e.g., Prisma Client).

### `npx prisma generate`

- Generates or regenerates Prisma Client based on the current Prisma schema.

### `npx prisma studio`

- Opens a web interface where you can view and edit data in your database.

### `npx prisma db push`

- Pushes the state of your Prisma schema to the database without generating migration files (suitable for prototyping).

Remember to run these commands in the directory containing your `prisma` folder to ensure they operate correctly. Each command helps in managing the lifecycle of your database schema and data during development.
