#!/bin/bash

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
    
    echo "$service service built successfully!"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Version can be passed as an argument, defaults to 'latest'
VERSION=${1:-latest}

# Build all services
echo "Starting build process with version: $VERSION"

# List of services
SERVICES=(
    "appointment-service"
    "doctor-service"
    "patient-service"
    "ingestion-service"
)

# Build each service
for service in "${SERVICES[@]}"; do
    if [ -d "services/$service" ]; then
        build_service "$service" "$VERSION"
    else
        echo "Warning: $service directory not found, skipping..."
    fi
done

echo "All services built successfully!"
