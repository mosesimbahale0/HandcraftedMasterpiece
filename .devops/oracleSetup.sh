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
