#!/bin/bash

# Source common configuration
source "$(dirname "$0")/config.sh"

# Function to encode value in base64
encode() {
    echo -n "$1" | base64
}

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

echo "All secrets generated successfully in infrastructure/k8s/ directory!"
echo
echo "Required environment variables:"
echo "AWS_ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY"
echo "AWS_REGION"
echo "MYSQL_USERNAME"
echo "MYSQL_PASSWORD"
echo "REDSHIFT_DATABASE"
echo "REDSHIFT_SECRET_ARN"
echo "REDSHIFT_WORKGROUP_NAME"
