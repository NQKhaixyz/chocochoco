# Database Setup Guide

## Option 1: SQLite (Easiest - No PostgreSQL Required)

Perfect for development and testing. No separate database server needed!

### Update .env

```bash
# Change DATABASE_URL to SQLite
DATABASE_URL=sqlite:./dev.db
```

### Install SQLite support

```bash
pnpm add better-sqlite3
pnpm add -D @types/better-sqlite3
```

### Run migrations

```bash
pnpm migrate
```

**Pros:** 
- ✅ No server setup required
- ✅ Single file database
- ✅ Perfect for development

**Cons:**
- ❌ Not suitable for production
- ❌ Limited concurrent connections

---

## Option 2: PostgreSQL with Docker (Recommended)

Run PostgreSQL in a container without system installation.

### Start PostgreSQL Container

```bash
# Windows PowerShell
docker run --name chocochoco-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=chocochoco_indexer `
  -p 5432:5432 `
  -d postgres:14
```

### Update .env

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chocochoco_indexer
```

### Run migrations

```bash
pnpm migrate
```

### Manage Container

```bash
# Stop
docker stop chocochoco-postgres

# Start
docker start chocochoco-postgres

# Remove
docker rm -f chocochoco-postgres

# View logs
docker logs chocochoco-postgres
```

**Pros:**
- ✅ Isolated environment
- ✅ Easy cleanup
- ✅ Production-like setup

**Cons:**
- ❌ Requires Docker Desktop

---

## Option 3: Install PostgreSQL Locally

### Windows

**Download Installer:**
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL 14+ installer
3. Run installer (keep defaults)
4. Remember the password you set for `postgres` user

**Or use Chocolatey:**
```powershell
choco install postgresql
```

**Or use Scoop:**
```powershell
scoop install postgresql
```

### After Installation

**Add PostgreSQL to PATH** (if not already):
```
C:\Program Files\PostgreSQL\14\bin
```

**Create Database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE chocochoco_indexer;
\q
```

**Update .env:**
```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/chocochoco_indexer
```

**Run migrations:**
```bash
pnpm migrate
```

---

## Option 4: Use Cloud Database (For Testing)

### ElephantSQL (Free Tier)

1. Go to https://www.elephantsql.com/
2. Sign up and create a free instance
3. Copy the connection URL
4. Update `.env`:
   ```bash
   DATABASE_URL=postgres://username:password@hostname/database
   ```

### Supabase (Free Tier)

1. Go to https://supabase.com/
2. Create new project
3. Go to Settings → Database → Connection string
4. Update `.env` with connection string

---

## Quick Fix: Use SQLite Now

**Fastest solution - no installation needed:**

```bash
cd c:\Users\DungLe\Documents\GitHub\chocochoco\indexer

# Update .env (use PowerShell)
(Get-Content .env) -replace 'DATABASE_URL=postgresql.*', 'DATABASE_URL=sqlite:./dev.db' | Set-Content .env

# Install SQLite support
pnpm add better-sqlite3 @types/better-sqlite3

# Update database pool to support SQLite (modify src/db/pool.ts)
# Then run migrations
pnpm migrate

# Start indexer
pnpm dev
```

---

## Verify Setup

After choosing an option, verify your setup:

```bash
# Test connection
pnpm tsx src/db/migrate.ts

# Should see:
# ✅ Database connection successful
# ✅ Migrations completed successfully
```

---

## Recommended Setup by Environment

| Environment | Recommendation | Why |
|-------------|---------------|-----|
| **Development (Quick)** | SQLite | No setup, works immediately |
| **Development (Full)** | Docker PostgreSQL | Production-like, easy cleanup |
| **CI/CD** | Docker PostgreSQL | Reproducible, isolated |
| **Production** | Cloud PostgreSQL | Managed, scalable, backups |

---

## Troubleshooting

### "psql: command not found"
→ PostgreSQL not installed or not in PATH  
**Solution:** Use Docker or SQLite

### "Connection refused"
→ PostgreSQL not running  
**Solution:** Start PostgreSQL service or Docker container

### "password authentication failed"
→ Wrong password in DATABASE_URL  
**Solution:** Check credentials, use correct password

### "database does not exist"
→ Database not created  
**Solution:** Run `createdb` or `CREATE DATABASE` in psql

---

**Choose the option that works best for you!**

For fastest start: **Use SQLite** (Option 1)  
For production-like: **Use Docker** (Option 2)
