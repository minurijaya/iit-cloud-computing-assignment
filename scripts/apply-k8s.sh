#!/bin/bash

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
echo "To watch deployment status in real-time:"
echo "kubectl get deployments -w"
echo
echo "To view pods:"
echo "kubectl get pods"
echo
echo "To view logs for a service:"
for service in "${SERVICES[@]}"; do
    echo "kubectl logs -f deployment/$service"
done
