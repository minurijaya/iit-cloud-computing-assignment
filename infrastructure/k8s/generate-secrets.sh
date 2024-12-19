#!/bin/bash

# Function to encode value in base64
encode() {
    echo -n "$1" | base64
}

# AWS Credentials
echo "Generating AWS secrets..."
cat > aws-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: aws-credentials
type: Opaque
data:
  AWS_ACCESS_KEY_ID: $(encode "$AWS_ACCESS_KEY_ID")
  AWS_SECRET_ACCESS_KEY: $(encode "$AWS_SECRET_ACCESS_KEY")
  AWS_REGION: $(encode "$AWS_REGION")
EOF

# MySQL Credentials
echo "Generating MySQL secrets..."
cat > mysql-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
type: Opaque
data:
  username: $(encode "$MYSQL_USERNAME")
  password: $(encode "$MYSQL_PASSWORD")
EOF

# Redshift Credentials
echo "Generating Redshift secrets..."
cat > redshift-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: redshift-secret
type: Opaque
data:
  REDSHIFT_DATABASE: $(encode "$REDSHIFT_DATABASE")
  REDSHIFT_SECRET_ARN: $(encode "$REDSHIFT_SECRET_ARN")
  REDSHIFT_WORKGROUP_NAME: $(encode "$REDSHIFT_WORKGROUP_NAME")
EOF

echo "Secrets generated successfully!"
