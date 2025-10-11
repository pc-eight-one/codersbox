---
title: "Kubernetes Mastery Part 7: ConfigMaps and Secrets"
description: "Learn to manage application configuration and sensitive data in Kubernetes using ConfigMaps and Secrets with security best practices."
publishDate: 2025-10-11
publishedAt: 2025-10-11
tags: ["kubernetes", "configmaps", "secrets", "configuration", "security", "devops"]
difficulty: "intermediate"
series: "Kubernetes Mastery"
part: 7
estimatedTime: "70 minutes"
totalParts: 10
---

# Part 7: ConfigMaps and Secrets

## Introduction

ConfigMaps and Secrets are Kubernetes objects that decouple configuration and sensitive data from container images. This allows you to maintain the same image across environments while changing configuration externally.

## ConfigMaps

ConfigMaps store non-confidential configuration data as key-value pairs.

### Creating ConfigMaps

#### 1. From Literal Values

```bash
# Create from command line
kubectl create configmap app-config \
  --from-literal=APP_ENV=production \
  --from-literal=LOG_LEVEL=info \
  --from-literal=MAX_CONNECTIONS=100

# View the ConfigMap
kubectl get configmap app-config -o yaml

# Describe it
kubectl describe configmap app-config
```

#### 2. From Files

```bash
# Create a configuration file
cat > app.properties << EOF
database.host=postgres.default.svc.cluster.local
database.port=5432
database.name=myapp
cache.enabled=true
cache.ttl=3600
EOF

# Create ConfigMap from file
kubectl create configmap app-properties --from-file=app.properties

# View the data
kubectl get configmap app-properties -o yaml
```

#### 3. From Environment File

```bash
# Create an env file
cat > app.env << EOF
APP_NAME=MyApplication
APP_VERSION=1.0.0
FEATURE_FLAG_A=enabled
FEATURE_FLAG_B=disabled
DEBUG=false
EOF

# Create ConfigMap from env file
kubectl create configmap app-env --from-env-file=app.env

# View the ConfigMap
kubectl get configmap app-env -o yaml
```

#### 4. From Directory

```bash
# Create multiple config files
mkdir -p config
cat > config/database.conf << EOF
host=postgres
port=5432
maxConnections=50
EOF

cat > config/cache.conf << EOF
enabled=true
ttl=3600
provider=redis
EOF

cat > config/logging.conf << EOF
level=info
format=json
output=stdout
EOF

# Create ConfigMap from directory
kubectl create configmap app-configs --from-file=config/

# View the ConfigMap
kubectl get configmap app-configs -o yaml
```

#### 5. Using YAML Manifest

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: default
data:
  # Simple key-value pairs
  APP_ENV: "production"
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"

  # Multi-line configuration
  nginx.conf: |
    server {
      listen 80;
      server_name example.com;

      location / {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
      }
    }

  app.json: |
    {
      "database": {
        "host": "postgres",
        "port": 5432
      },
      "cache": {
        "enabled": true,
        "ttl": 3600
      }
    }
```

```bash
# Apply the ConfigMap
kubectl apply -f configmap.yaml

# View it
kubectl get configmap app-config -o yaml
```

### Using ConfigMaps

#### 1. As Environment Variables

```yaml
# pod-env-configmap.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod-env
spec:
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "env && sleep 3600"]
    env:
      # Single environment variable from ConfigMap
      - name: APP_ENVIRONMENT
        valueFrom:
          configMapKeyRef:
            name: app-config
            key: APP_ENV
      - name: LOG_LEVEL
        valueFrom:
          configMapKeyRef:
            name: app-config
            key: LOG_LEVEL
```

```bash
# Apply the pod
kubectl apply -f pod-env-configmap.yaml

# View environment variables
kubectl logs app-pod-env | grep -E "APP_ENVIRONMENT|LOG_LEVEL"
```

#### 2. All Keys as Environment Variables

```yaml
# pod-envfrom-configmap.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod-envfrom
spec:
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "env && sleep 3600"]
    envFrom:
      # Load all keys from ConfigMap
      - configMapRef:
          name: app-env
```

```bash
# Apply the pod
kubectl apply -f pod-envfrom-configmap.yaml

# View all environment variables
kubectl logs app-pod-envfrom
```

#### 3. As Volume Mounts

```yaml
# pod-volume-configmap.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod-volume
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
      - name: config-volume
        mountPath: /etc/config
      - name: nginx-config
        mountPath: /etc/nginx/conf.d
  volumes:
    - name: config-volume
      configMap:
        name: app-configs
    - name: nginx-config
      configMap:
        name: app-config
        items:
          - key: nginx.conf
            path: default.conf
```

```bash
# Apply the pod
kubectl apply -f pod-volume-configmap.yaml

# View mounted files
kubectl exec app-pod-volume -- ls -la /etc/config
kubectl exec app-pod-volume -- cat /etc/config/database.conf
kubectl exec app-pod-volume -- cat /etc/nginx/conf.d/default.conf
```

#### 4. Specific Keys as Files

```yaml
# pod-selective-configmap.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod-selective
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
      - name: config
        mountPath: /etc/app
  volumes:
    - name: config
      configMap:
        name: app-config
        items:
          - key: app.json
            path: config.json
            mode: 0644
          - key: nginx.conf
            path: nginx.conf
            mode: 0644
```

```bash
# Apply and test
kubectl apply -f pod-selective-configmap.yaml
kubectl exec app-pod-selective -- ls -la /etc/app
```

### Deployment with ConfigMap

```yaml
# deployment-configmap.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:alpine
        env:
          - name: APP_ENV
            valueFrom:
              configMapKeyRef:
                name: app-config
                key: APP_ENV
        envFrom:
          - configMapRef:
              name: app-env
        volumeMounts:
          - name: config
            mountPath: /etc/nginx/conf.d
            readOnly: true
      volumes:
        - name: config
          configMap:
            name: app-config
            items:
              - key: nginx.conf
                path: default.conf
```

```bash
# Apply the deployment
kubectl apply -f deployment-configmap.yaml

# Verify environment variables in pods
kubectl exec deployment/web-app -- env | grep APP_
```

## Secrets

Secrets store sensitive data like passwords, tokens, and keys. They're base64 encoded (NOT encrypted by default).

### Creating Secrets

#### 1. From Literal Values

```bash
# Create generic secret
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password='myS3cr3tP@ssw0rd'

# View the secret (values are base64 encoded)
kubectl get secret db-credentials -o yaml

# Decode a value
kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 --decode
echo  # New line
```

#### 2. From Files

```bash
# Create files with sensitive data
echo -n "admin" > username.txt
echo -n "myS3cr3tP@ssw0rd" > password.txt

# Create secret from files
kubectl create secret generic db-files \
  --from-file=username=username.txt \
  --from-file=password=password.txt

# Clean up sensitive files
rm username.txt password.txt

# View the secret
kubectl get secret db-files -o yaml
```

#### 3. Docker Registry Secret

```bash
# Create docker-registry secret for private registries
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=myusername \
  --docker-password=mypassword \
  --docker-email=myemail@example.com

# View the secret
kubectl get secret regcred -o yaml
```

#### 4. TLS Secret

```bash
# Generate TLS certificate and key
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key \
  -out tls.crt \
  -subj "/CN=example.com/O=example"

# Create TLS secret
kubectl create secret tls tls-secret \
  --cert=tls.crt \
  --key=tls.key

# Clean up files
rm tls.crt tls.key

# View the secret
kubectl get secret tls-secret -o yaml
```

#### 5. Using YAML Manifest

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  # Base64 encoded values
  # echo -n "admin" | base64
  username: YWRtaW4=
  # echo -n "mypassword" | base64
  password: bXlwYXNzd29yZA==

---
# Using stringData (automatic base64 encoding)
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets-plain
type: Opaque
stringData:
  # Plain text - will be automatically base64 encoded
  api-key: "sk_live_123456789abcdefghijklmnop"
  db-connection: "postgresql://user:pass@host:5432/db"
```

```bash
# Create secrets
kubectl apply -f secret.yaml

# View secrets
kubectl get secrets
kubectl describe secret app-secrets-plain
```

### Using Secrets

#### 1. As Environment Variables

```yaml
# pod-env-secret.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod-secret-env
spec:
  containers:
  - name: app
    image: postgres:15-alpine
    env:
      - name: POSTGRES_USER
        valueFrom:
          secretKeyRef:
            name: app-secrets
            key: username
      - name: POSTGRES_PASSWORD
        valueFrom:
          secretKeyRef:
            name: app-secrets
            key: password
      - name: API_KEY
        valueFrom:
          secretKeyRef:
            name: app-secrets-plain
            key: api-key
```

```bash
# Apply the pod
kubectl apply -f pod-env-secret.yaml

# Verify (note: showing secrets in logs is for demo only!)
kubectl exec app-pod-secret-env -- env | grep POSTGRES_USER
```

#### 2. All Keys as Environment Variables

```yaml
# pod-envfrom-secret.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod-secret-envfrom
spec:
  containers:
  - name: app
    image: busybox:latest
    command: ["sh", "-c", "env && sleep 3600"]
    envFrom:
      - secretRef:
          name: app-secrets
```

#### 3. As Volume Mounts

```yaml
# pod-volume-secret.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod-secret-volume
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
      - name: secrets
        mountPath: "/etc/secrets"
        readOnly: true
  volumes:
    - name: secrets
      secret:
        secretName: app-secrets
        defaultMode: 0400  # Read-only for owner
```

```bash
# Apply the pod
kubectl apply -f pod-volume-secret.yaml

# View mounted secrets
kubectl exec app-pod-secret-volume -- ls -la /etc/secrets
kubectl exec app-pod-secret-volume -- cat /etc/secrets/username
```

#### 4. Using Docker Registry Secret

```yaml
# pod-private-image.yaml
apiVersion: v1
kind: Pod
metadata:
  name: private-app
spec:
  containers:
  - name: app
    image: myregistry.com/myapp:latest
  imagePullSecrets:
    - name: regcred
```

#### 5. Using TLS Secret in Ingress

```yaml
# ingress-tls.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  tls:
    - hosts:
        - example.com
      secretName: tls-secret
  rules:
    - host: example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

## Updating ConfigMaps and Secrets

### Updating ConfigMaps

```bash
# Method 1: Edit directly
kubectl edit configmap app-config

# Method 2: Replace with new file
cat > new-config.yaml << EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: "staging"
  LOG_LEVEL: "debug"
  NEW_SETTING: "value"
EOF

kubectl replace -f new-config.yaml

# Method 3: Patch specific values
kubectl patch configmap app-config -p '{"data":{"LOG_LEVEL":"debug"}}'

# Method 4: Delete and recreate
kubectl delete configmap app-config
kubectl create configmap app-config --from-literal=APP_ENV=production
```

### Automatic Pod Updates

**Environment Variables:** NOT automatically updated (requires pod restart)

**Volume Mounts:** Automatically updated (may take up to 1 minute)

```yaml
# deployment-auto-reload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app-reload
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
      annotations:
        # Add annotation to force pod recreation on config change
        configmap.reloader.stakater.com/reload: "app-config"
    spec:
      containers:
      - name: web
        image: nginx:alpine
        volumeMounts:
          - name: config
            mountPath: /etc/config
      volumes:
        - name: config
          configMap:
            name: app-config
```

### Forcing Pod Restart After Update

```bash
# Update ConfigMap
kubectl patch configmap app-config -p '{"data":{"LOG_LEVEL":"debug"}}'

# Force pod restart
kubectl rollout restart deployment web-app

# Watch the rollout
kubectl rollout status deployment web-app

# Verify new configuration
kubectl exec deployment/web-app -- cat /etc/config/LOG_LEVEL
```

### Using Reloader (Automated Approach)

```bash
# Install Reloader
kubectl apply -f https://raw.githubusercontent.com/stakater/Reloader/master/deployments/kubernetes/reloader.yaml

# Add annotation to deployment
kubectl annotate deployment web-app \
  reloader.stakater.com/auto="true"

# Or specify specific ConfigMaps/Secrets
kubectl annotate deployment web-app \
  configmap.reloader.stakater.com/reload="app-config,app-env"
```

## Best Practices

### ConfigMap Best Practices

1. **Separate Configuration from Code**

```yaml
# Good: Configuration externalized
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-prod
data:
  DATABASE_HOST: "prod-db.example.com"
  CACHE_TTL: "7200"
  LOG_LEVEL: "warn"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-dev
data:
  DATABASE_HOST: "dev-db.example.com"
  CACHE_TTL: "60"
  LOG_LEVEL: "debug"
```

2. **Use Namespaces for Environment Separation**

```bash
# Create environment-specific namespaces
kubectl create namespace production
kubectl create namespace staging
kubectl create namespace development

# Create same-named ConfigMaps in each namespace
kubectl create configmap app-config \
  --from-literal=ENV=production \
  -n production

kubectl create configmap app-config \
  --from-literal=ENV=staging \
  -n staging
```

3. **Version Your ConfigMaps**

```yaml
# Include version in name
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-v1
data:
  version: "1.0.0"
  # ... other config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-v2
data:
  version: "2.0.0"
  # ... updated config
```

### Secret Best Practices

1. **Use RBAC to Restrict Access**

```yaml
# role-secrets-reader.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "list"]
    resourceNames: ["app-secrets"]  # Specific secret only
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-secrets
  namespace: production
subjects:
  - kind: ServiceAccount
    name: app-sa
    namespace: production
roleRef:
  kind: Role
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```

2. **Enable Encryption at Rest**

```bash
# Create encryption config (on control plane)
sudo mkdir -p /etc/kubernetes/encryption

sudo cat > /etc/kubernetes/encryption/config.yaml << EOF
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: $(head -c 32 /dev/urandom | base64)
      - identity: {}
EOF

# Edit kube-apiserver manifest
sudo vim /etc/kubernetes/manifests/kube-apiserver.yaml

# Add these flags:
# - --encryption-provider-config=/etc/kubernetes/encryption/config.yaml

# Mount the config:
# volumeMounts:
# - name: encryption-config
#   mountPath: /etc/kubernetes/encryption
#   readOnly: true
# volumes:
# - name: encryption-config
#   hostPath:
#     path: /etc/kubernetes/encryption
#     type: DirectoryOrCreate
```

3. **Use External Secret Management**

```bash
# Install External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets \
  external-secrets/external-secrets \
  -n external-secrets-system \
  --create-namespace

# Example: AWS Secrets Manager integration
```

```yaml
# external-secret.yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets
  namespace: production
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-external-secret
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets
    kind: SecretStore
  target:
    name: app-secrets
    creationPolicy: Owner
  data:
    - secretKey: db-password
      remoteRef:
        key: prod/db/password
```

4. **Never Commit Secrets to Git**

```bash
# Add to .gitignore
echo "*.secret.yaml" >> .gitignore
echo "*-secret.yaml" >> .gitignore
echo "secrets/" >> .gitignore

# Use sealed-secrets for GitOps
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Install kubeseal CLI on Ubuntu
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-0.24.0-linux-amd64.tar.gz
tar -xvzf kubeseal-0.24.0-linux-amd64.tar.gz
sudo install -m 755 kubeseal /usr/local/bin/kubeseal

# Create sealed secret
kubectl create secret generic mysecret \
  --from-literal=password=mypassword \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > mysealedsecret.yaml

# Now you can safely commit mysealedsecret.yaml
```

5. **Rotate Secrets Regularly**

```bash
# Create new secret version
kubectl create secret generic db-credentials-v2 \
  --from-literal=username=admin \
  --from-literal=password='newP@ssw0rd123'

# Update deployment to use new secret
kubectl set env deployment/app --from=secret/db-credentials-v2

# Verify rollout
kubectl rollout status deployment/app

# Delete old secret after verification
kubectl delete secret db-credentials
```

## Practical Exercises

### Exercise 1: Multi-Environment Application

```bash
# Create environments
kubectl create namespace dev
kubectl create namespace staging
kubectl create namespace prod
```

```yaml
# dev-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: dev
data:
  APP_ENV: "development"
  LOG_LEVEL: "debug"
  DATABASE_HOST: "dev-db.dev.svc.cluster.local"
  CACHE_ENABLED: "false"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: dev
type: Opaque
stringData:
  db-password: "dev-password"
  api-key: "dev-api-key-12345"
```

```yaml
# prod-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: prod
data:
  APP_ENV: "production"
  LOG_LEVEL: "warn"
  DATABASE_HOST: "prod-db.prod.svc.cluster.local"
  CACHE_ENABLED: "true"
  CACHE_TTL: "7200"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: prod
type: Opaque
stringData:
  db-password: "super-secure-prod-password"
  api-key: "prod-api-key-abcdefghijk"
```

```yaml
# deployment-template.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: nginx:alpine
        env:
          - name: APP_ENV
            valueFrom:
              configMapKeyRef:
                name: app-config
                key: APP_ENV
          - name: DB_PASSWORD
            valueFrom:
              secretKeyRef:
                name: app-secrets
                key: db-password
        envFrom:
          - configMapRef:
              name: app-config
```

```bash
# Deploy to each environment
kubectl apply -f dev-config.yaml
kubectl apply -f prod-config.yaml
kubectl apply -f deployment-template.yaml -n dev
kubectl apply -f deployment-template.yaml -n prod

# Verify configurations
kubectl exec -n dev deployment/myapp -- env | grep APP_ENV
kubectl exec -n prod deployment/myapp -- env | grep APP_ENV
```

### Exercise 2: Application with Configuration Files

```bash
# Create configuration files
mkdir -p configs

cat > configs/database.ini << EOF
[database]
host = postgres.default.svc.cluster.local
port = 5432
max_connections = 50
timeout = 30
EOF

cat > configs/redis.conf << EOF
bind 0.0.0.0
port 6379
maxmemory 256mb
maxmemory-policy allkeys-lru
EOF

cat > configs/application.yaml << EOF
server:
  port: 8080
  host: 0.0.0.0
features:
  authentication: true
  caching: true
  monitoring: true
EOF

# Create ConfigMap from files
kubectl create configmap app-configs --from-file=configs/

# Create deployment using the configs
cat > app-with-configs.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: configured-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: configured-app
  template:
    metadata:
      labels:
        app: configured-app
    spec:
      containers:
      - name: app
        image: nginx:alpine
        volumeMounts:
          - name: configs
            mountPath: /etc/app/config
            readOnly: true
      volumes:
        - name: configs
          configMap:
            name: app-configs
EOF

kubectl apply -f app-with-configs.yaml

# Verify mounted configs
kubectl exec deployment/configured-app -- ls -la /etc/app/config
kubectl exec deployment/configured-app -- cat /etc/app/config/database.ini
```

### Exercise 3: Secret Rotation

```bash
# Initial secret
kubectl create secret generic api-credentials \
  --from-literal=api-key=initial-key-12345

# Create deployment
cat > app-with-secret.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-app
  template:
    metadata:
      labels:
        app: api-app
    spec:
      containers:
      - name: app
        image: busybox:latest
        command: ["sh", "-c", "while true; do echo API_KEY=\$API_KEY; sleep 30; done"]
        env:
          - name: API_KEY
            valueFrom:
              secretKeyRef:
                name: api-credentials
                key: api-key
EOF

kubectl apply -f app-with-secret.yaml

# Check current key
kubectl logs deployment/api-app

# Rotate secret
kubectl create secret generic api-credentials-new \
  --from-literal=api-key=rotated-key-67890

# Update deployment to use new secret
kubectl patch deployment api-app -p '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "app",
          "env": [{
            "name": "API_KEY",
            "valueFrom": {
              "secretKeyRef": {
                "name": "api-credentials-new",
                "key": "api-key"
              }
            }
          }]
        }]
      }
    }
  }
}'

# Watch rollout
kubectl rollout status deployment/api-app

# Verify new key
kubectl logs deployment/api-app

# Clean up old secret
kubectl delete secret api-credentials
kubectl delete secret api-credentials-new
```

## Summary

In this part, you learned:

- Creating ConfigMaps from literals, files, directories, and YAML
- Using ConfigMaps as environment variables and volumes
- Creating different types of Secrets (generic, docker-registry, TLS)
- Using Secrets securely in pods and deployments
- Updating ConfigMaps and Secrets with automatic/manual pod reloads
- Best practices for configuration and secret management
- Encryption at rest and external secret management
- Multi-environment configuration strategies

**Key Commands:**

```bash
# ConfigMaps
kubectl create configmap <name> --from-literal=key=value
kubectl create configmap <name> --from-file=file.txt
kubectl create configmap <name> --from-env-file=app.env
kubectl get configmap <name> -o yaml

# Secrets
kubectl create secret generic <name> --from-literal=key=value
kubectl create secret docker-registry <name> --docker-server=<server>
kubectl create secret tls <name> --cert=cert.crt --key=cert.key
kubectl get secret <name> -o jsonpath='{.data.key}' | base64 -d

# Updates
kubectl edit configmap <name>
kubectl patch configmap <name> -p '{"data":{"key":"value"}}'
kubectl rollout restart deployment <name>
```

In Part 8, we'll explore Persistent Storage with Volumes, PersistentVolumes, and StatefulSets for stateful applications.
