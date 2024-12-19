#!/bin/bash

# =================================================================
# Kubernetes Deployment Version Updater
# =================================================================
#
# This script updates the Docker image version in all Kubernetes 
# deployment files for services defined in config.sh.
#
# Prerequisites:
# -----------------------------------------------------------------
# - Deployment files must exist in services/<service>/k8s/deployment.yaml
# - Docker images should be built and pushed with the target version
#
# Usage:
# -----------------------------------------------------------------
#   Update to specific version:
#     ./scripts/update-versions.sh v1.0.0
#
# Arguments:
# -----------------------------------------------------------------
#   VERSION  Required. The version tag to update deployments to.
#
# Services:
# -----------------------------------------------------------------
# Services are defined in config.sh. Current services:
#   - appointment-service
#   - doctor-service
#   - patient-service
#   - ingestion-service
#
# Files Modified:
# -----------------------------------------------------------------
# For each service, updates:
#   services/<service>/k8s/deployment.yaml
#
# Changes Made:
# -----------------------------------------------------------------
# Updates the image version in container spec:
#   image: $DOCKER_USERNAME/<service>:<version>
#
# Example:
#   image: minurijayasooriya97/appointment-service:v1.0.0
# =================================================================

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
    
    echo "✓ Updated $deployment_file"
    echo
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
echo

# Update each service's deployment file
for service in "${SERVICES[@]}"; do
    update_version "$service" "$VERSION"
done

echo "All deployment files updated successfully!"
echo
echo "Next step:"
echo "Apply the changes to Kubernetes:"
echo "  ./scripts/apply-k8s.sh"
