# PostgreSQL Docker Setup

This README provides instructions on setting up a PostgreSQL database using Docker and Docker Compose.

## Prerequisites

Before you can run the PostgreSQL container, you need to install Docker.

### Installing Docker

- **For Mac**: Visit [Docker for Mac](https://docs.docker.com/desktop/mac/install/) and follow the instructions to download and install Docker Desktop for Mac.
- **For Windows**: Visit [Docker for Windows](https://docs.docker.com/desktop/windows/install/) and follow the instructions to download and install Docker Desktop for Windows.

## Running the PostgreSQL Container

Once Docker is installed, you can use Docker Compose to manage your PostgreSQL container.

1. **Start the container**:
   Navigate to the directory containing your `docker-compose.yml` file and run the following command:

   ```bash
   docker-compose up -d
   ```

2. **Stop the container**:
   When you're done and want to stop the container, use:
   ```bash
   docker-compose down
   ```

## Accessing the Database

You can access the PostgreSQL database in several ways:

### Using `psql` Command Line Tool

1. **Accessing through Docker Exec**:
   If you have `psql` installed on your host machine, you can connect to your database by running:

   ```bash
   docker exec -it mdms-postgres psql -U postgres -d development
   ```

2. **Using a GUI Tool**:
   You can also use GUI tools like PGAdmin or DBeaver. Configure your connection with the following settings:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: `postgres`
   - **Database**: `development`

Remember to replace `development` with the name of any other database you create and want to connect to.
