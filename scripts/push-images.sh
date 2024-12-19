#!/bin/bash

# Source common configuration
source "$(dirname "$0")/config.sh"

# Function to push a service
push_service() {
    local service=$1
    local version=${2:-latest}  # Use 'latest' if no version specified
    
    echo "Pushing $service service..."
    
    # Push the image to Docker Hub
    docker push "$DOCKER_USERNAME/$service:$version"
    
    echo "$service service pushed successfully!"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if logged into Docker Hub
if ! docker pull hello-world > /dev/null 2>&1; then
    echo "Please log in to Docker Hub:"
    docker login
    if [ $? -ne 0 ]; then
        echo "Docker login failed. Please try again."
        exit 1
    fi
fi

# Version can be passed as an argument, defaults to 'latest'
VERSION=${1:-latest}

# Push all services
echo "Starting push process with version: $VERSION"

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
