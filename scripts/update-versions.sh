#!/bin/bash

# Source common configuration
source "$(dirname "$0")/config.sh"

# Function to update version in a deployment file
update_version() {
    local service=$1
    local version=${2:-latest}
    local deployment_file="services/$service/k8s/deployment.yaml"
    
    if [ ! -f "$deployment_file" ]; then
        echo "Warning: Deployment file not found for $service, skipping..."
        return
    fi
    
    echo "Updating version for $service to $version..."
    
    # Use sed to update the image version
    # For macOS, we need to use '' after -i for compatibility
    sed -i '' "s|image: $DOCKER_USERNAME/$service:.*|image: $DOCKER_USERNAME/$service:$version|" "$deployment_file"
    
    echo "Updated $deployment_file"
}

# Version must be provided as an argument
if [ -z "$1" ]; then
    echo "Error: Version must be provided"
    echo "Usage: $0 <version>"
    echo "Example: $0 v1.0.0"
    exit 1
fi

VERSION=$1

echo "Updating all deployment files to version: $VERSION"

# Update each service's deployment file
for service in "${SERVICES[@]}"; do
    update_version "$service" "$VERSION"
done

echo "All deployment files updated successfully!"
echo
echo "To apply the changes:"
echo "kubectl apply -f infrastructure/k8s/"
for service in "${SERVICES[@]}"; do
    echo "kubectl apply -f services/$service/k8s/deployment.yaml"
done
