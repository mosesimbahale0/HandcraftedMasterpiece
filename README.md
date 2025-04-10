# HandcraftedMasterpiece
The Artisan’s Touch Architecture

A celebration of craftsmanship in code and design, HandcraftedMasterpiece is where architecture meets artistry. This repository is dedicated to meticulously designed systems, thoughtfully engineered to balance elegance, functionality, and performance.



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
  `docker compose --env-file .env up -d`


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










# SSH 
ssh -i <path_to_private_key> vmusername@vmpublicip

- PROTECT SSH
chmod 600 ~/Desktop/SSH/ssh-key-2025-04-03.key


SS;L SETUP - LET'S ENCRYPT


#  ORACLE DEPLOYMENT GUIDE
#!/bin/bash

# Update system packages
echo "Updating system packages..."
sudo dnf update -y

# Install required dependencies (Including Git)
echo "Installing dependencies (curl, git, yum-utils)..."
sudo dnf install -y yum-utils curl git

# Verify Git installation
echo "Verifying Git installation..."
git --version || { echo "Git installation failed!"; exit 1; }

# Install Docker
echo "Adding Docker repository..."
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

echo "Installing Docker..."
sudo dnf install -y docker-ce docker-ce-cli containerd.io

# Enable and start Docker
echo "Enabling and starting Docker..."
sudo systemctl enable --now docker

# Add user to Docker group and switch group
echo "Adding user to Docker group..."
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker installation
echo "Verifying Docker installation..."
docker --version || { echo "Docker installation failed!"; exit 1; }

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify Docker Compose installation
echo "Verifying Docker Compose installation..."
docker-compose --version || { echo "Docker Compose installation failed!"; exit 1; }

# Install Nginx
echo "Installing Nginx..."
sudo dnf install -y nginx
sudo systemctl enable --now nginx

# Verify Nginx installation
echo "Verifying Nginx installation..."
nginx -v || { echo "Nginx installation failed!"; exit 1; }

echo "Installation Complete! 🎉🎉🎉🎉🎉🎉🎉🎉"




----








# GCP VIRTUAL MACHINE CI/CD

1. Create VM
2. Add ssh keys
```
ssh-keygen -t ed25519 -C "your_email@example.com"

```

3.  Ensure Correct Permissions
```
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

4. Acces the Private Key and Add to Actions
```
cat ~/.ssh/id_ed25519

```

4.0 CLONE ANOTHER REPO TO RESOLVE THE HANDSHAKE SECURITY ISSUE




4.1. Access Public Key and Add to Github 
```
cat ~/.ssh/id_ed25519.pub

```

5. Install Prereqs.

```
#!/bin/bash

# Update and install prerequisites
echo "Installing prerequisites..."
sudo apt update && sudo apt install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  software-properties-common \
  tree\
  git

# Install Docker and Docker Compose
echo "Installing Docker and Docker Compose..."
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=$(dpkg --print-architecture)] https://download.docker.com/linux/debian bookworm stable"
sudo apt update && sudo apt install -y docker-ce docker-compose


# Start Docker  services
echo "Starting Docker ..."
sudo systemctl start docker

# Verify installations
echo "Verifying installations..."
docker --version
docker-compose --version

git -v
tree --version

echo "Setup completed successfully!"

# Add user to Docker group and switch group
echo "Adding user to Docker group..."
sudo usermod -aG docker $USER
newgrp docker


echo "ALL OPERATIONS COMPLETED SUCCESSFULLY! 🎉🎉🎉🎉🎉🎉🎉🎉"
```


---

6. Deploy 

```
 mkdir HandcraftedMasterpiece

```

```
sudo nano .env

```




6.1. Configure VM : Passwordless Sudo:

```
sudo visudo

```
Run whoami for username

```
moseimbahale0 ALL=(ALL) NOPASSWD: ALL

```


<!-- 7. Configure Nginx - Edit your Nginx config on the VM

```
sudo nano /etc/nginx/sites-available/default

```

Replace with:
 mkdir HandcraftedMasterpiece
```
server {
    listen 80;

    # Route all traffic to frontend running on port 3000
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        try_files $uri $uri/ /index.html;
    }
}


``` -->


8. Prepare Domain & Point to the non-ephemeral IP (External IP)


9.  Enable HTTPS with Certbot (Let's Encrypt)
```
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx


```

10. Configure VM : Passwordless Sudo:

```
sudo visudo

```
Run whoami for username

```
moseimbahale ALL=(ALL) NOPASSWD: ALL

```

