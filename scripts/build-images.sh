#!/bin/bash

# =================================================================
# Docker Image Builder
# =================================================================
#
# This script builds Docker images for all services defined in 
# config.sh. Each service must have a Dockerfile in its directory.
#
# Prerequisites:
# -----------------------------------------------------------------
# - Docker daemon must be running
# - Each service directory must contain a valid Dockerfile
#
# Usage:
# -----------------------------------------------------------------
#   Build with latest tag:
#     ./scripts/build-images.sh
#
#   Build with specific version:
#     ./scripts/build-images.sh v1.0.0
#
# Arguments:
# -----------------------------------------------------------------
#   VERSION  Optional. Docker image tag (default: 'latest')
#
# Services:
# -----------------------------------------------------------------
# Services are defined in config.sh
#
# Output:
# -----------------------------------------------------------------
# Docker images will be built locally with the naming convention:
#   $DOCKER_USERNAME/<service-name>:<version>
#
# Example:
#   minurijayasooriya97/appointment-service:v1.0.0
# =================================================================

# Source common configuration
source "$(dirname "$0")/config.sh"

# Function to build a service
build_service() {
    local service=$1
    local version=${2:-latest}  # Use 'latest' if no version specified
    
    echo "Building $service service..."
    
    # Navigate to service directory
    cd "services/$service" || exit 1
    
    # Build the Docker image
    docker build -t "$DOCKER_USERNAME/$service:$version" .
    
    # Return to root directory
    cd ../..
    
    echo "✓ $service service built successfully!"
    echo
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Version can be passed as an argument, defaults to 'latest'
VERSION=${1:-latest}

echo "Starting build process with version: $VERSION"
echo

# Build each service from config.sh
for service in "${SERVICES[@]}"; do
    if [ -d "services/$service" ]; then
        build_service "$service" "$VERSION"
    else
        echo "Warning: $service directory not found, skipping..."
    fi
done

echo "All services built successfully!"
echo
echo "Next steps:"
echo "1. Push images to Docker Hub:"
echo "   ./scripts/push-images.sh $VERSION"
echo
echo "2. Update deployment files:"
echo "   ./scripts/update-versions.sh $VERSION"
