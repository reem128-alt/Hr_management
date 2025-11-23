# Docker Container Verification Guide

## 1. Check Container Status

```bash
# List running containers
docker ps

# Check all containers (including stopped)
docker ps -a

# Using docker-compose
docker-compose ps
```

## 2. View Container Logs

```bash
# View logs for all services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f postgres

# View last 100 lines
docker-compose logs --tail=100 app
```

## 3. Check Container Health

```bash
# Inspect container health status
docker inspect --format='{{.State.Health.Status}}' hr-app

# View health check logs
docker inspect hr-app | grep -A 10 Health
```

## 4. Test Application Endpoints

```bash
# Test if app is responding (Windows PowerShell)
curl http://localhost:3000

# Or using browser
# Open: http://localhost:3000
```

## 5. Access Container Shell

```bash
# Execute bash in running container
docker exec -it hr-app sh

# Check if app is running inside container
docker exec hr-app ps aux

# Check environment variables
docker exec hr-app env
```

## 6. Database Connection Test

```bash
# Access PostgreSQL container
docker exec -it hr-postgres psql -U postgres -d hr_management

# Inside PostgreSQL shell, run:
# \dt  -- List tables
# \q   -- Quit
```

## 7. Check Network Connectivity

```bash
# Test if app can reach database
docker exec hr-app ping postgres

# Check network
docker network inspect hr-network
```

## 8. Monitor Resource Usage

```bash
# View container resource usage
docker stats

# View specific container stats
docker stats hr-app
```

## 9. Common Issues & Solutions

### Container exits immediately
```bash
# Check exit code and error
docker logs hr-app
docker inspect hr-app | grep -A 5 State
```

### Port already in use
```bash
# Check what's using port 3000 (Windows)
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Database connection fails
```bash
# Verify database is running
docker exec hr-postgres pg_isready -U postgres

# Check database logs
docker-compose logs postgres
```

## 10. Stop and Clean Up

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove specific container
docker stop hr-app
docker rm hr-app

# Remove image
docker rmi hr-management:latest
```

## Quick Health Check Script (PowerShell)

```powershell
# Save as check-docker.ps1
Write-Host "Checking Docker containers..." -ForegroundColor Green

# Check if containers are running
docker ps --filter "name=hr-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test app endpoint
Write-Host "`nTesting application endpoint..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    Write-Host "✓ App is responding (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ App is not responding" -ForegroundColor Red
}

# Check logs for errors
Write-Host "`nRecent errors in logs:" -ForegroundColor Yellow
docker-compose logs --tail=20 app | Select-String -Pattern "error|Error|ERROR"
```

## Access Points

- **Application API**: http://localhost:3000
- **PgAdmin** (if enabled): http://localhost:5050
  - Email: admin@hrmanagement.com
  - Password: admin
- **PostgreSQL**: localhost:5432
  - Database: hr_management
  - User: postgres
  - Password: Reem1994$
