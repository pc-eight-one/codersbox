---
title: "Kubernetes Mastery - Part 4: Working with Pods"
description: "Master Kubernetes Pods - the fundamental building block. Learn pod lifecycle, create pods with YAML, implement multi-container patterns, use init containers, understand pod networking, and debug effectively."
publishDate: 2025-10-11
publishedAt: 2025-10-11
tags: ["Kubernetes", "Pods", "Containers", "YAML", "Debugging", "Networking"]
difficulty: "beginner"
series: "Kubernetes Mastery"
part: 4
estimatedTime: "90 minutes"
totalParts: 10
---

# Kubernetes Mastery - Part 4: Working with Pods

Pods are the smallest deployable units in Kubernetes and the foundation of everything else. In this tutorial, we'll master pods through theory, practical examples, and real-world scenarios.

## What is a Pod?

A **Pod** is a group of one or more containers that share:
- Network namespace (same IP address)
- Storage volumes
- Lifecycle

```
┌────────────────────────────────────┐
│             Pod                    │
│  IP: 10.244.1.5                    │
│                                    │
│  ┌──────────────┐  ┌────────────┐ │
│  │ Container 1  │  │Container 2 │ │
│  │   (nginx)    │  │  (logger)  │ │
│  │              │  │            │ │
│  │ Port: 80     │  │            │ │
│  └──────────────┘  └────────────┘ │
│                                    │
│  Shared Volumes:                   │
│  ┌──────────────────────────────┐ │
│  │  /var/log (shared logs)      │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘

Key Points:
- Containers in pod share localhost (127.0.0.1)
- One IP per pod, not per container
- Containers share volumes
- Scheduled together on same node
```

## Pod Lifecycle

### Pod Phases

```bash
# Pod goes through these phases:

1. Pending
   - Pod accepted by cluster
   - Containers not yet created
   - Reasons: Scheduling, image pulling

2. Running
   - Pod assigned to node
   - At least one container is running

3. Succeeded
   - All containers completed successfully
   - Won't be restarted

4. Failed
   - All containers terminated
   - At least one failed (non-zero exit)

5. Unknown
   - Cannot determine pod state
   - Usually node communication issue
```

### Container States

```bash
# Each container in pod has a state:

1. Waiting
   - Container not yet running
   - Example: Pulling image

2. Running
   - Container executing

3. Terminated
   - Container finished or failed
```

### Check Pod Status

```bash
# View pods
kubectl get pods

# Example output:
# NAME           READY   STATUS    RESTARTS   AGE
# nginx-pod      1/1     Running   0          5m
# failing-pod    0/1     CrashLoopBackOff  3   5m

# Detailed status
kubectl describe pod nginx-pod

# Watch pod status in real-time
kubectl get pods -w

# Check pod with wide output (shows node and IP)
kubectl get pods -o wide
```

## Creating Pods

### Method 1: Imperative (kubectl run)

```bash
# Create simple pod
kubectl run nginx --image=nginx

# Create pod with command
kubectl run busybox --image=busybox --command -- sleep 3600

# Create pod with environment variable
kubectl run nginx --image=nginx --env="ENV=production"

# Create pod with resource limits
kubectl run nginx --image=nginx --requests='cpu=100m,memory=256Mi' --limits='cpu=200m,memory=512Mi'

# Create pod with labels
kubectl run nginx --image=nginx --labels="app=web,tier=frontend"

# Create pod and expose port
kubectl run nginx --image=nginx --port=80

# Dry-run (generate YAML without creating)
kubectl run nginx --image=nginx --dry-run=client -o yaml

# Save to file
kubectl run nginx --image=nginx --dry-run=client -o yaml > pod.yaml
```

### Method 2: Declarative (YAML Manifest)

```yaml
# simple-pod.yaml
apiVersion: v1              # API version
kind: Pod                   # Resource type
metadata:
  name: nginx-pod           # Pod name
  labels:
    app: web                # Labels for selection
    tier: frontend
spec:
  containers:
  - name: nginx             # Container name
    image: nginx:1.25       # Image with tag
    ports:
    - containerPort: 80     # Port exposed by container
```

```bash
# Create pod from YAML
kubectl apply -f simple-pod.yaml

# Verify
kubectl get pods

# View pod details
kubectl describe pod nginx-pod

# Delete pod
kubectl delete -f simple-pod.yaml
# OR
kubectl delete pod nginx-pod
```

## Comprehensive Pod Manifest

Let's create a production-ready pod with all common settings:

```yaml
# advanced-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
    version: v1
    environment: production
  annotations:
    description: "Production application pod"
    owner: "platform-team"
spec:
  # Restart policy: Always, OnFailure, Never
  restartPolicy: Always

  # Node selection
  nodeSelector:
    disktype: ssd

  # DNS policy
  dnsPolicy: ClusterFirst

  # Service account
  serviceAccountName: myapp-sa

  # Security context (pod-level)
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000

  # Containers
  containers:
  - name: myapp
    image: myapp:1.0

    # Pull policy: Always, IfNotPresent, Never
    imagePullPolicy: IfNotPresent

    # Command and args
    command: ["/bin/sh"]
    args: ["-c", "while true; do echo hello; sleep 10; done"]

    # Ports
    ports:
    - name: http
      containerPort: 8080
      protocol: TCP

    # Environment variables
    env:
    - name: ENV
      value: "production"
    - name: DB_HOST
      value: "postgres.default.svc.cluster.local"
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password

    # Resource requests and limits
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"
      limits:
        memory: "512Mi"
        cpu: "500m"

    # Volume mounts
    volumeMounts:
    - name: app-storage
      mountPath: /data
    - name: config
      mountPath: /etc/config

    # Liveness probe (restart if fails)
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3

    # Readiness probe (remove from service if fails)
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 3

    # Startup probe (for slow-starting apps)
    startupProbe:
      httpGet:
        path: /startup
        port: 8080
      initialDelaySeconds: 0
      periodSeconds: 10
      failureThreshold: 30

    # Security context (container-level)
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      runAsNonRoot: true
      capabilities:
        drop:
        - ALL

  # Volumes
  volumes:
  - name: app-storage
    emptyDir: {}
  - name: config
    configMap:
      name: app-config
```

```bash
# Apply the manifest
kubectl apply -f advanced-pod.yaml

# Check pod
kubectl get pod myapp-pod

# Describe to see all details
kubectl describe pod myapp-pod
```

## Multi-Container Pods

### Sidecar Pattern

Container that enhances the main container.

```yaml
# sidecar-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-with-logger
spec:
  containers:
  # Main container
  - name: nginx
    image: nginx
    ports:
    - containerPort: 80
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log/nginx

  # Sidecar container (log processor)
  - name: log-sidecar
    image: busybox
    command: ["sh", "-c"]
    args:
    - >
      while true; do
        if [ -f /var/log/nginx/access.log ]; then
          tail -f /var/log/nginx/access.log | grep -E '404|500';
        fi;
        sleep 5;
      done
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log/nginx

  volumes:
  - name: shared-logs
    emptyDir: {}
```

```bash
# Create pod
kubectl apply -f sidecar-pod.yaml

# View logs from main container
kubectl logs web-with-logger -c nginx

# View logs from sidecar
kubectl logs web-with-logger -c log-sidecar

# Generate traffic to nginx
kubectl exec -it web-with-logger -c nginx -- curl localhost

# Check sidecar logs
kubectl logs web-with-logger -c log-sidecar -f
```

### Ambassador Pattern

Proxy to external services.

```yaml
# ambassador-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-ambassador
spec:
  containers:
  # Main application
  - name: app
    image: myapp
    env:
    - name: DATABASE_URL
      value: "localhost:5432"  # Connect to ambassador

  # Ambassador (database proxy)
  - name: db-ambassador
    image: haproxy
    ports:
    - containerPort: 5432
    volumeMounts:
    - name: config
      mountPath: /usr/local/etc/haproxy

  volumes:
  - name: config
    configMap:
      name: haproxy-config
```

### Adapter Pattern

Transform output to standard format.

```yaml
# adapter-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-adapter
spec:
  containers:
  # Main application (writes custom logs)
  - name: app
    image: myapp
    volumeMounts:
    - name: logs
      mountPath: /var/log

  # Adapter (converts logs to JSON)
  - name: log-adapter
    image: fluent/fluentd
    volumeMounts:
    - name: logs
      mountPath: /var/log

  volumes:
  - name: logs
    emptyDir: {}
```

## Init Containers

Containers that run before app containers, used for setup tasks.

```yaml
# init-container-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-with-init
spec:
  # Init containers run sequentially before app containers
  initContainers:
  # First init container: Check database is ready
  - name: wait-for-db
    image: busybox
    command:
    - sh
    - -c
    - |
      until nslookup postgres.default.svc.cluster.local; do
        echo "Waiting for database...";
        sleep 2;
      done;
      echo "Database is ready!"

  # Second init container: Run migrations
  - name: run-migrations
    image: myapp:1.0
    command: ["python", "manage.py", "migrate"]
    env:
    - name: DATABASE_URL
      value: "postgres://user:pass@postgres:5432/db"

  # Third init container: Download config
  - name: fetch-config
    image: curlimages/curl
    command:
    - sh
    - -c
    - curl -o /config/app.conf https://config-server/app.conf
    volumeMounts:
    - name: config
      mountPath: /config

  # Main application container
  containers:
  - name: myapp
    image: myapp:1.0
    volumeMounts:
    - name: config
      mountPath: /etc/myapp

  volumes:
  - name: config
    emptyDir: {}
```

```bash
# Create pod
kubectl apply -f init-container-pod.yaml

# Watch pod initialization
kubectl get pods -w

# Check init container logs
kubectl logs myapp-with-init -c wait-for-db
kubectl logs myapp-with-init -c run-migrations
kubectl logs myapp-with-init -c fetch-config

# Main container logs
kubectl logs myapp-with-init -c myapp
```

## Health Checks (Probes)

### Liveness Probe

Restarts container if fails.

```yaml
# liveness-probe.yaml
apiVersion: v1
kind: Pod
metadata:
  name: liveness-http
spec:
  containers:
  - name: app
    image: myapp
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
        httpHeaders:
        - name: Custom-Header
          value: Awesome
      initialDelaySeconds: 3    # Wait before first check
      periodSeconds: 3          # Check every 3 seconds
      timeoutSeconds: 1         # Timeout after 1 second
      failureThreshold: 3       # Restart after 3 failures
      successThreshold: 1       # Success after 1 success
```

### Readiness Probe

Removes from service if fails (doesn't restart).

```yaml
# readiness-probe.yaml
apiVersion: v1
kind: Pod
metadata:
  name: readiness-http
spec:
  containers:
  - name: app
    image: myapp
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
```

### Probe Types

```yaml
# HTTP GET probe
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
    scheme: HTTP

# TCP Socket probe
livenessProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 20

# Exec probe (run command)
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 5
  periodSeconds: 5

# gRPC probe (Kubernetes 1.24+)
livenessProbe:
  grpc:
    port: 9090
  initialDelaySeconds: 10
```

## Resource Management

```yaml
# resources-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: myapp
    resources:
      # Requests: Guaranteed minimum
      requests:
        memory: "256Mi"  # 256 mebibytes
        cpu: "250m"      # 250 millicores = 0.25 CPU

      # Limits: Maximum allowed
      limits:
        memory: "512Mi"
        cpu: "500m"
```

```bash
# CPU units:
# 1 CPU = 1000m (millicores)
# 250m = 0.25 CPU = 25% of one CPU core

# Memory units:
# Mi = Mebibyte (1024^2 bytes)
# Gi = Gibibyte (1024^3 bytes)
# M = Megabyte (1000^2 bytes)
# G = Gigabyte (1000^3 bytes)

# Check resource usage
kubectl top pod resource-demo

# See node resources
kubectl top nodes

# Describe node to see allocatable resources
kubectl describe node <node-name>
```

## Pod Networking

```
Pod Networking in Kubernetes:

┌─────────────────────────────────────────────┐
│              Node 1                         │
│  ┌──────────────────────────────────────┐   │
│  │         Pod 1                        │   │
│  │     IP: 10.244.1.5                   │   │
│  │  ┌────────────┐  ┌─────────────┐    │   │
│  │  │Container A │  │Container B  │    │   │
│  │  │localhost   │  │localhost    │    │   │
│  │  │Port 80     │  │Port 3000    │    │   │
│  │  └────────────┘  └─────────────┘    │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │         Pod 2                        │   │
│  │     IP: 10.244.1.6                   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

Key Rules:
1. Each pod gets unique IP
2. Containers in pod share network namespace
3. Containers communicate via localhost
4. Pods can reach each other directly via IP
5. No NAT between pods
```

```bash
# Check pod IP
kubectl get pods -o wide

# Test pod-to-pod communication
kubectl exec -it pod1 -- curl http://<pod2-ip>

# Test container-to-container (same pod)
kubectl exec -it multi-container-pod -c container1 -- curl localhost:3000
```

## Debugging Pods

### Common Commands

```bash
# View pod logs
kubectl logs pod-name

# Logs from specific container
kubectl logs pod-name -c container-name

# Follow logs (tail -f)
kubectl logs pod-name -f

# Previous container logs (if crashed)
kubectl logs pod-name --previous

# Last 100 lines
kubectl logs pod-name --tail=100

# Logs since 1 hour ago
kubectl logs pod-name --since=1h

# Execute command in pod
kubectl exec pod-name -- ls /

# Interactive shell
kubectl exec -it pod-name -- /bin/bash
# or
kubectl exec -it pod-name -- sh

# Execute in specific container
kubectl exec -it pod-name -c container-name -- sh

# Copy files to/from pod
kubectl cp pod-name:/path/to/file ./local-file
kubectl cp ./local-file pod-name:/path/to/file

# Port forward to access pod locally
kubectl port-forward pod-name 8080:80
# Access at localhost:8080

# Get pod YAML
kubectl get pod pod-name -o yaml

# Describe pod (events, status, etc.)
kubectl describe pod pod-name

# Watch pod status
kubectl get pods -w

# Delete pod
kubectl delete pod pod-name

# Delete pod immediately (force)
kubectl delete pod pod-name --grace-period=0 --force
```

### Troubleshooting Scenarios

#### Pod Stuck in Pending

```bash
# Check pod events
kubectl describe pod pod-name

# Common causes:
# 1. Insufficient resources
kubectl describe nodes

# 2. No nodes available
kubectl get nodes

# 3. Image pull issues
kubectl describe pod pod-name | grep -A 10 Events
```

#### Pod CrashLoopBackOff

```bash
# View logs
kubectl logs pod-name

# Check previous logs
kubectl logs pod-name --previous

# Describe pod
kubectl describe pod pod-name

# Common causes:
# 1. Application error
# 2. Wrong command/args
# 3. Missing dependencies
# 4. Failed health checks
```

#### ImagePullBackOff

```bash
# Check image name and tag
kubectl describe pod pod-name

# Common causes:
# 1. Wrong image name
# 2. Image doesn't exist
# 3. No pull permissions
# 4. Registry authentication needed

# Fix: Use correct image
kubectl set image pod/pod-name container-name=correct-image:tag

# Fix: Add imagePullSecrets for private registry
kubectl create secret docker-registry regcred \
  --docker-server=<registry> \
  --docker-username=<username> \
  --docker-password=<password> \
  --docker-email=<email>
```

## Practical Exercises

### Exercise 1: Create a Simple Web Server

```yaml
# web-server.yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-server
  labels:
    app: web
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
```

```bash
# Create pod
kubectl apply -f web-server.yaml

# Check status
kubectl get pods

# Get pod IP
kubectl get pod web-server -o wide

# Test from another pod
kubectl run test --image=curlimages/curl -it --rm -- curl http://<pod-ip>

# Port forward to access locally
kubectl port-forward web-server 8080:80

# Access at http://localhost:8080

# Clean up
kubectl delete pod web-server test
```

### Exercise 2: Multi-Container with Shared Volume

```yaml
# shared-volume.yaml
apiVersion: v1
kind: Pod
metadata:
  name: shared-volume-pod
spec:
  containers:
  - name: writer
    image: busybox
    command: ["/bin/sh"]
    args: ["-c", "while true; do date >> /data/log.txt; sleep 5; done"]
    volumeMounts:
    - name: shared-data
      mountPath: /data

  - name: reader
    image: busybox
    command: ["/bin/sh"]
    args: ["-c", "tail -f /data/log.txt"]
    volumeMounts:
    - name: shared-data
      mountPath: /data

  volumes:
  - name: shared-data
    emptyDir: {}
```

```bash
# Create pod
kubectl apply -f shared-volume.yaml

# View writer logs
kubectl logs shared-volume-pod -c writer

# View reader logs (should show dates)
kubectl logs shared-volume-pod -c reader -f

# Clean up
kubectl delete pod shared-volume-pod
```

## Key Takeaways

- **Pod = smallest deployable unit**, contains one or more containers
- **Containers in pod share** network (same IP, localhost) and volumes
- **Pod lifecycle**: Pending → Running → Succeeded/Failed
- **Init containers** run before app containers, useful for setup
- **Multi-container patterns**: Sidecar, Ambassador, Adapter
- **Health probes**: Liveness (restart), Readiness (remove from service), Startup
- **Resource management**: requests (guaranteed) vs limits (maximum)
- **Debugging**: logs, describe, exec, port-forward

## What's Next

In Part 5, we'll explore **Deployments and ReplicaSets**:
- Managing pod replicas
- Rolling updates and rollbacks
- Deployment strategies (blue-green, canary)
- Scaling applications
- Self-healing mechanisms

Pods are building blocks, but Deployments make them production-ready!
