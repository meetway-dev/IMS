# Quick Fix: PostgreSQL Database Setup

## ⚡ One-Time Setup (Choose Your OS)

### Windows
1. Open **pgAdmin** (installed with PostgreSQL) OR use Command Prompt:
   ```cmd
   psql -U postgres
   ```

2. Inside psql, run:
   ```sql
   CREATE USER ims WITH PASSWORD 'ims';
   ALTER USER ims CREATEDB;
   CREATE DATABASE ims OWNER ims;
   \q
   ```

3. Verify:
   ```cmd
   psql -U ims -d ims -h localhost
   # Should connect. Type: \q to exit
   ```

### macOS (Homebrew)
```bash
# Start PostgreSQL if not running
brew services start postgresql@15

# Create user and database
psql -U postgres

# Inside psql:
CREATE USER ims WITH PASSWORD 'ims';
ALTER USER ims CREATEDB;
CREATE DATABASE ims OWNER ims;
\q

# Verify
psql -U ims -d ims -h localhost
```

### Linux (Ubuntu/Debian)
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Connect as postgres user
sudo -u postgres psql

# Inside psql:
CREATE USER ims WITH PASSWORD 'ims';
ALTER USER ims CREATEDB;
CREATE DATABASE ims OWNER ims;
\q

# Verify (you'll be prompted for password)
psql -U ims -d ims -h localhost
```

---

## 🚀 After Setup

```bash
# Test connection
npm run db:test-connection

# If it passes, run full setup
npm run db:setup

# Start development
npm run dev
```

---

## 🔐 Alternative: Use Different Credentials

If you want to use different PostgreSQL credentials:

1. Create user in PostgreSQL:
   ```sql
   CREATE USER myuser WITH PASSWORD 'mypassword';
   ALTER USER myuser CREATEDB;
   CREATE DATABASE mydb OWNER myuser;
   ```

2. Update `.env` file:
   ```env
   DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydb?schema=public&sslmode=disable
   POSTGRES_USER=myuser
   POSTGRES_PASSWORD=mypassword
   POSTGRES_DB=mydb
   ```

3. Test and setup:
   ```bash
   npm run db:test-connection
   npm run db:setup
   ```

---

## ❓ Still Getting Errors?

Check the [SETUP_GUIDE.md](../SETUP_GUIDE.md) in the root directory for comprehensive troubleshooting.
