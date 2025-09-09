# Merlin Gallery Backend

This directory contains the Express.js backend for the Merlin Gallery application.

## Database Setup and Migrations

This project uses [Prisma](https://www.prisma.io/) to manage the database schema. The database connection is configured in `prisma/schema.prisma`.

**Do not manually edit the database schema.** Use Prisma Migrate to apply schema changes.

### First-Time Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Create your environment file:**
    Copy the `.env.example` file to a new file named `.env` and fill in the required environment variables. For local development, you can use a SQLite database.
    ```
    DATABASE_URL="file:./prisma/dev.db"
    ```

3.  **Run the initial migration:**
    This command will create the database (if it doesn't exist) and apply all existing migrations to create the database schema.
    ```bash
    npx prisma migrate dev --name init
    ```

### Making Schema Changes

1.  **Modify the schema:**
    Edit the `prisma/schema.prisma` file to make your desired changes to the data model.

2.  **Create a new migration:**
    Run the `migrate dev` command to generate a new SQL migration file based on your schema changes and apply it to your database.
    ```bash
    npx prisma migrate dev --name <your-migration-name>
    ```
    Replace `<your-migration-name>` with a descriptive name for your migration (e.g., `add-user-model`).

3.  **Generate the Prisma Client:**
    Prisma Migrate automatically generates the Prisma Client based on your schema, but you can also run it manually if needed:
    ```bash
    npx prisma generate
    ```

By following this process, you ensure that the database schema stays in sync with the Prisma schema definition.
