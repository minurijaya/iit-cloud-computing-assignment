#!/bin/bash

# =================================================================
# Kubernetes Secrets Generator
# =================================================================
#
# This script generates Kubernetes secret files for AWS, MySQL, and 
# Redshift credentials. All secrets will be base64 encoded.
#
# Required Environment Variables:
# -----------------------------------------------------------------
# AWS Credentials:
#   AWS_ACCESS_KEY_ID         - Your AWS access key
#   AWS_SECRET_ACCESS_KEY     - Your AWS secret key
#   AWS_REGION               - AWS region (e.g., eu-north-1)
#
# MySQL Credentials:
#   MYSQL_USERNAME           - MySQL database username
#   MYSQL_PASSWORD           - MySQL database password
#
# Redshift Credentials:
#   REDSHIFT_DATABASE        - Redshift database name
#   REDSHIFT_SECRET_ARN      - ARN of the Redshift secret
#   REDSHIFT_WORKGROUP_NAME  - Redshift workgroup name
#
# Usage:
# -----------------------------------------------------------------
#   1. Export all required environment variables:
#      export AWS_ACCESS_KEY_ID="your_key"
#      export AWS_SECRET_ACCESS_KEY="your_secret"
#      ...
#
#   2. Run the script:
#      ./scripts/generate-secrets.sh
#
# Output:
# -----------------------------------------------------------------
# The script will generate three files in infrastructure/k8s/:
#   - aws-secret.yaml
#   - mysql-secret.yaml
#   - redshift-secret.yaml
#
# Note: These files contain sensitive information and should not be
# committed to version control.
# =================================================================

# Source common configuration
source "$(dirname "$0")/config.sh"

# Function to encode value in base64
encode() {
    echo -n "$1" | base64
}

# Function to check if required env var is set
check_env_var() {
    local var_name=$1
    if [ -z "${!var_name}" ]; then
        echo "Error: $var_name environment variable is not set"
        exit 1
    fi
}

# Check all required environment variables
echo "Checking required environment variables..."
required_vars=(
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "AWS_REGION"
    "MYSQL_USERNAME"
    "MYSQL_PASSWORD"
    "REDSHIFT_DATABASE"
    "REDSHIFT_SECRET_ARN"
    "REDSHIFT_WORKGROUP_NAME"
)

for var in "${required_vars[@]}"; do
    check_env_var "$var"
done
echo " All required environment variables are set"
echo

# Function to generate a secret file
generate_secret() {
    local name=$1
    local output_file="infrastructure/k8s/$name-secret.yaml"
    shift
    local content=$1

    echo "Generating $name secrets..."
    echo "$content" > "$output_file"
    echo "Generated $output_file"
}

# AWS Secrets
generate_secret "aws" "apiVersion: v1
kind: Secret
metadata:
  name: aws-credentials
type: Opaque
data:
  AWS_ACCESS_KEY_ID: $(encode "$AWS_ACCESS_KEY_ID")
  AWS_SECRET_ACCESS_KEY: $(encode "$AWS_SECRET_ACCESS_KEY")
  AWS_REGION: $(encode "$AWS_REGION")"

# MySQL Secrets
generate_secret "mysql" "apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
type: Opaque
data:
  username: $(encode "$MYSQL_USERNAME")
  password: $(encode "$MYSQL_PASSWORD")"

# Redshift Secrets
generate_secret "redshift" "apiVersion: v1
kind: Secret
metadata:
  name: redshift-secret
type: Opaque
data:
  REDSHIFT_DATABASE: $(encode "$REDSHIFT_DATABASE")
  REDSHIFT_SECRET_ARN: $(encode "$REDSHIFT_SECRET_ARN")
  REDSHIFT_WORKGROUP_NAME: $(encode "$REDSHIFT_WORKGROUP_NAME")"

echo
echo "All secrets generated successfully in infrastructure/k8s/ directory!"
