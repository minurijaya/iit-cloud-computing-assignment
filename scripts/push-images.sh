#!/bin/bash

# =================================================================
# Docker Image Push Script
# =================================================================
#
# This script pushes Docker images for all services defined in 
# config.sh to Docker Hub. Images must be built first using 
# build-images.sh.
#
# Prerequisites:
# -----------------------------------------------------------------
# - Docker daemon must be running
# - Must be logged into Docker Hub (docker login)
# - Images must be built locally first
#
# Usage:
# -----------------------------------------------------------------
#   Push images with latest tag:
#     ./scripts/push-images.sh
#
#   Push images with specific version:
#     ./scripts/push-images.sh v1.0.0
#
# Arguments:
# -----------------------------------------------------------------
#   VERSION  Optional. Docker image tag to push (default: 'latest')
#
# Services:
# -----------------------------------------------------------------
# Services are defined in config.sh. Current services:
#   - appointment-service
#   - doctor-service
#   - patient-service
#   - ingestion-service
#
# Images:
# -----------------------------------------------------------------
# Script will push images with the naming convention:
#   $DOCKER_USERNAME/<service-name>:<version>
#
# Example:
#   minurijayasooriya97/appointment-service:v1.0.0
#
# Note: Make sure you have the necessary permissions to push to
# these repositories on Docker Hub.
# =================================================================

# Source common configuration
source "$(dirname "$0")/config.sh"

# Function to push a service
push_service() {
    local service=$1
    local version=${2:-latest}  # Use 'latest' if no version specified
    
    echo "Pushing $service service..."
    
    # Push the image to Docker Hub
    docker push "$DOCKER_USERNAME/$service:$version"
    
    echo "✓ $service service pushed successfully!"
    echo
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if logged into Docker Hub
if ! docker pull hello-world > /dev/null 2>&1; then
    echo "Please log in to Docker Hub:"
    docker login
    if [ $? -ne 0 ]; then
        echo "Error: Docker login failed. Please try again."
        exit 1
    fi
fi

# Version can be passed as an argument, defaults to 'latest'
VERSION=${1:-latest}

echo "Starting push process with version: $VERSION"
echo

# List of services
SERVICES=(
    "appointment-service"
    "doctor-service"
    "patient-service"
    "ingestion-service"
)

# Push each service
for service in "${SERVICES[@]}"; do
    push_service "$service" "$VERSION"
done

echo "All services pushed successfully!"
echo
echo "Next step:"
echo "Update deployment files:"
echo "  ./scripts/update-versions.sh $VERSION"
