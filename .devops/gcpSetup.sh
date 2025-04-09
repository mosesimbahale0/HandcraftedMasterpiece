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