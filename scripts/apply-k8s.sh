#!/bin/bash

# =================================================================
# Kubernetes Resource Applicator
# =================================================================
#
# This script applies all Kubernetes resources in the correct order:
# 1. Infrastructure secrets (AWS, MySQL, Redshift)
# 2. Service deployments
#
# Prerequisites:
# -----------------------------------------------------------------
# - kubectl must be installed and configured
# - Kubernetes cluster must be accessible
# - Secret files must exist in infrastructure/k8s/
# - Deployment files must exist in services/<service>/k8s/
#
# Usage:
# -----------------------------------------------------------------
#   Apply all resources:
#     ./scripts/apply-k8s.sh
#
# Resources Applied:
# -----------------------------------------------------------------
# Secrets (in infrastructure/k8s/):
#   - aws-secret.yaml
#   - mysql-secret.yaml
#   - redshift-secret.yaml
#
# Deployments (in services/<service>/k8s/):
#   - appointment-service/deployment.yaml
#   - doctor-service/deployment.yaml
#   - patient-service/deployment.yaml
#   - ingestion-service/deployment.yaml
#
# Note: Secrets are applied first to ensure they are available
# when the services start up.
# =================================================================

# Source common configuration
source "$(dirname "$0")/config.sh"

# Function to apply k8s resources
apply_resource() {
    local file=$1
    echo "Applying $file..."
    kubectl apply -f "$file"
    
    # Check if the apply was successful
    if [ $? -ne 0 ]; then
        echo "Error applying $file"
        exit 1
    fi
}

echo "Applying Kubernetes resources..."
echo

# First apply secrets
echo "Applying secrets..."
for secret in aws mysql redshift; do
    apply_resource "infrastructure/k8s/$secret-secret.yaml"
done
echo "✓ Secrets applied successfully"
echo

# Then apply service deployments
echo "Applying service deployments..."
for service in "${SERVICES[@]}"; do
    deployment_file="services/$service/k8s/deployment.yaml"
    if [ -f "$deployment_file" ]; then
        apply_resource "$deployment_file"
    else
        echo "Warning: Deployment file not found for $service, skipping..."
    fi
done
echo "✓ Service deployments applied successfully"
echo

# Check deployment status
echo "Checking deployment status..."
echo
kubectl get deployments
echo
echo "Helpful commands:"
echo "-----------------------------------------------------------------"
echo "Watch deployment status:"
echo "  kubectl get deployments -w"
echo
echo "View pods:"
echo "  kubectl get pods"
echo
echo "View logs for a service:"
for service in "${SERVICES[@]}"; do
    echo "  kubectl logs -f deployment/$service"
done
