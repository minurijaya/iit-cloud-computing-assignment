#!/bin/bash

# =================================================================
# Kubernetes Version Updater
# =================================================================
#
# This script updates the Docker image versions in Kubernetes 
# resource files (deployment.yaml and cronjob.yaml).
#
# Prerequisites:
# -----------------------------------------------------------------
# - Service directories must exist
# - K8s resource files must exist in services/<service>/k8s/
#
# Usage:
# -----------------------------------------------------------------
#   Update to specific version:
#     ./scripts/update-versions.sh v1.0.0
#
# Arguments:
# -----------------------------------------------------------------
#   VERSION  Required. Version to update to (e.g., v1.0.0)
#
# Files Updated:
# -----------------------------------------------------------------
# For each service in config.sh, updates:
#   - services/<service>/k8s/deployment.yaml
#   - services/<service>/k8s/cronjob.yaml
# =================================================================

# Source common configuration
source "$(dirname "$0")/config.sh"

# Check if version was provided
if [ -z "$1" ]; then
    echo "Error: Version argument is required"
    echo "Usage: $0 <version>"
    echo "Example: $0 v1.0.0"
    exit 1
fi

VERSION=$1

# Function to update version in a file
update_version() {
    local file=$1
    local service=$2
    
    echo "Updating $file..."
    
    # Use sed to update the image version
    # This handles both deployment.yaml and cronjob.yaml formats
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS requires an empty string for -i
        sed -i '' "s|image: $DOCKER_USERNAME/$service:.*|image: $DOCKER_USERNAME/$service:$VERSION|" "$file"
    else
        # Linux doesn't
        sed -i "s|image: $DOCKER_USERNAME/$service:.*|image: $DOCKER_USERNAME/$service:$VERSION|" "$file"
    fi
    
    echo "✓ Updated $file"
}

echo "Updating Kubernetes resources to version: $VERSION"
echo

# Update each service
for service in "${SERVICES[@]}"; do
    echo "Processing $service..."
    
    # Check for deployment.yaml
    deployment_file="services/$service/k8s/deployment.yaml"
    if [ -f "$deployment_file" ]; then
        update_version "$deployment_file" "$service"
    fi
    
    # Check for cronjob.yaml
    cronjob_file="services/$service/k8s/cronjob.yaml"
    if [ -f "$cronjob_file" ]; then
        update_version "$cronjob_file" "$service"
    fi
    
    # If neither file exists, show warning
    if [ ! -f "$deployment_file" ] && [ ! -f "$cronjob_file" ]; then
        echo "Warning: No deployment.yaml or cronjob.yaml found for $service, skipping..."
    fi
    
    echo
done

echo "All versions updated successfully!"
echo
echo "Next step:"
echo "Apply the changes:"
echo "  ./scripts/apply-k8s.sh"
