# HandcraftedMasterpiece
The Artisan’s Touch Architecture



# HandcraftedPrototype
Custom Made Architecture



# Run locally
1. client 
- change directory to client and run npm run dev for development service or npm start

2. server
- Change directory to server & run npm run dev or npm start





# Manual Deployment

### Docker Compose

- Create .env file & add these credentials:
  `sudo nano .env`

- Add the credentials below to the .env file:

```
MONGODB_URI="your_mongodb_uri"


```

- Start the containers:
  `docker compose --env-file .env up`


# Start with PM2 on VM

# Nginx config





# Automated Deployment Guide: GitHub Actions + SSH

Deployment Architecture

GitHub Repository → GitHub Actions → SSH to VM → Docker Deployment

---

1. Prerequisites

- GitHub Repository with your application code

- Virtual Machine (AWS EC2, DigitalOcean Droplet, etc.) with:

- SSH access (port 22 open)

- Docker and Docker Compose installed


- Basic understanding of YAML and shell commands

--- 

2. VM Setup (Preparation)
-  Initial Configuration

```
# Connect to your VM
ssh username@your-server-ip

# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

- Create Deployment Directory

```
mkdir -p ~/app/deploy
cd ~/app
```

-  Repository Structure
```
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── client/
│   ├── Dockerfile
│   └── ...
├── server/
│   ├── Dockerfile
│   └── ...
└── docker-compose.prod.yml

```

- Generate SSH Key Pair on VM:
```
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions

```


- Add Public Key to VM's authorized_keys:
```
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

```

- Copy Private Key for GitHub Secrets:
```
cat ~/.ssh/github_actions
```

 - GitHub Actions Configuration

 ```
 Add these in GitHub → Settings → Secrets:

DEPLOY_HOST: Your server IP

DEPLOY_USER: SSH username

SSH_PRIVATE_KEY: Contents of github_actions private key

MONGODB_URI: Your database connection string

```

- Workflow File (.github/workflows/deploy.yml)
```
name: Production Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18

    - name: Install dependencies
      working-directory: ./server
      run: npm ci

    - name: Build Docker images
      run: |
        docker-compose -f docker-compose.prod.yml build

    - name: Set up SSH
      uses: webfactory/ssh-agent@v0.7.0
      with:
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

    - name: Copy files via SCP
      run: |
        scp -o StrictHostKeyChecking=no -r . ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }}:~/app/deploy

    - name: Run Deployment Commands
      run: |
        ssh -o StrictHostKeyChecking=no ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }} << EOF
          cd ~/app/deploy
          docker-compose -f docker-compose.prod.yml down
          docker-compose -f docker-compose.prod.yml up -d
          docker system prune -f
        EOF
```

- docker-compose.prod.yml
```
version: '3.8'

services:
  server:
    build: ./server
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - NODE_ENV=production
      - PORT=4000
    ports:
      - "4000:4000"
    networks:
      - app-network
    restart: unless-stopped

  web:
    build: ./client
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://server:4000
    ports:
      - "80:3000"
    depends_on:
      - server
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

```

--- 
-  Post-Deployment Checks

```
# Check running containers
docker ps

# View server logs
docker logs -f server

# Verify network connections
docker network inspect app-network

# Check application health
curl http://localhost:4000/health

```

---
 
 - Security Best Practices - SSH Hardening:

- - **On VM:** `sudo nano /etc/ssh/sshd_config`

- -  Disable root login: PermitRootLogin no

- -  Use key authentication only: PasswordAuthentication no

- -  Change default SSH port

--- 


- Firewall Rules:

```
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # Web
sudo ufw allow 4000/tcp  # API
sudo ufw enable

```

--- 

- Docker Security:

- - Use non-root user in containers

- - Regular vulnerability scanning

- - Keep images updated

---


- Maintenance & Monitoring
- - Update Strategy
```
Push changes to main branch

GitHub Actions will automatically:

Build new images

Transfer updated files

Redeploy containers
```


 - - Log Management

```
# View combined logs
docker-compose logs -f

# Rotate logs
docker run --log-opt max-size=10m --log-opt max-file=3
```
---

- Troubleshooting Guide

Issue	Solution
SSH Connection Refused	Verify firewall rules and SSH daemon status
Docker Permission Denied	Ensure user is in docker group
Container Failing to Start	Check docker logs [container]
Network Connectivity Issues	Verify Docker network configuration
Environment Variables Missing	Check GitHub Secrets and compose file

----

- Advanced Configuration Options

- - Blue-Green Deployment: Add reverse proxy (Nginx/Traefik)

- - Database Migration: Add pre-deployment migration step

- - Rollback Strategy:

```
# In deployment commands:
docker tag app-web:current app-web:previous
```

- - Monitoring: Add Prometheus/Grafana

- - Notifications: Add Slack/Email alerts in GitHub Actions

**Important Note: Always test your deployment pipeline in a staging environment before production use!**


