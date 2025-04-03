#!/bin/bash

# Update and install prerequisites
echo "Installing prerequisites..."
sudo apt update && sudo apt install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  software-properties-common \
  nginx \
  tree\
  git

# Install Docker and Docker Compose
echo "Installing Docker and Docker Compose..."
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=$(dpkg --print-architecture)] https://download.docker.com/linux/debian bookworm stable"
sudo apt update && sudo apt install -y docker-ce docker-compose


# Start Docker and Nginx services
echo "Starting Docker and Nginx..."
sudo systemctl start docker
sudo systemctl start nginx

# Verify installations
echo "Verifying installations..."
docker --version
docker-compose --version
nginx -v
git -v
tree --version

echo "Setup completed successfully!"


