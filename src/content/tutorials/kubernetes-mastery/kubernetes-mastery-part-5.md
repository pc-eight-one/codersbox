---
title: "Kubernetes Mastery - Part 5: Deployments and ReplicaSets"
description: "Master Kubernetes Deployments and ReplicaSets for production workloads. Learn rolling updates, rollbacks, scaling strategies, self-healing, and deployment patterns like blue-green and canary deployments."
publishDate: 2025-10-11
publishedAt: 2025-10-11
tags: ["Kubernetes", "Deployments", "ReplicaSets", "Scaling", "Rolling Updates", "Blue-Green"]
difficulty: "intermediate"
series: "Kubernetes Mastery"
part: 5
estimatedTime: "90 minutes"
totalParts: 10
---

# Kubernetes Mastery - Part 5: Deployments and ReplicaSets

In production, you rarely create pods directly. Instead, you use **Deployments** and **ReplicaSets** to manage pods at scale with features like rolling updates, rollbacks, and self-healing.

## Understanding the Hierarchy

```
Deployment (declares desired state)
    ↓ (creates and manages)
ReplicaSet (ensures N pod replicas)
    ↓ (creates and monitors)
Pod (runs containers)
    ↓
Containers (actual application)

Example:
my-app Deployment (replicas: 3)
  ├─ my-app-7d4b8c6f9d ReplicaSet (current version)
  │   ├─ my-app-7d4b8c6f9d-abc12 Pod
  │   ├─ my-app-7d4b8c6f9d-def34 Pod
  │   └─ my-app-7d4b8c6f9d-ghi56 Pod
  └─ my-app-5f6a7b8c9e ReplicaSet (old version, scaled to 0)
```

## ReplicaSets

A **ReplicaSet** ensures a specified number of pod replicas are running at any given time.

### Creating a ReplicaSet

```yaml
# replicaset.yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-replicaset
  labels:
    app: nginx
spec:
  replicas: 3  # Desired number of pods
  selector:
    matchLabels:
      app: nginx  # Must match pod template labels
  template:
    # Pod template
    metadata:
      labels:
        app: nginx  # Must match selector
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
```

```bash
# Create ReplicaSet
kubectl apply -f replicaset.yaml

# View ReplicaSets
kubectl get replicasets
kubectl get rs  # Short name

# Expected output:
# NAME                DESIRED   CURRENT   READY   AGE
# nginx-replicaset    3         3         3       30s

# View pods created by ReplicaSet
kubectl get pods

# Expected output:
# NAME                      READY   STATUS    RESTARTS   AGE
# nginx-replicaset-abc12    1/1     Running   0          30s
# nginx-replicaset-def34    1/1     Running   0          30s
# nginx-replicaset-ghi56    1/1     Running   0          30s

# Describe ReplicaSet
kubectl describe rs nginx-replicaset

# Scale ReplicaSet
kubectl scale rs nginx-replicaset --replicas=5

# Delete one pod - watch ReplicaSet recreate it
kubectl delete pod nginx-replicaset-abc12
kubectl get pods -w  # Watch automatic recreation

# Delete ReplicaSet (and all pods)
kubectl delete rs nginx-replicaset
```

### ReplicaSet Self-Healing

```bash
# ReplicaSet continuously monitors pod count

# Scenario: Pod crashes
Initial:  [Pod1] [Pod2] [Pod3]  (3 pods)
Pod2 crashes: [Pod1] [CRASH] [Pod3]  (2 pods)
ReplicaSet detects: Desired=3, Actual=2
ReplicaSet creates: [Pod1] [Pod3] [Pod4]  (3 pods again)

# Scenario: Manual scale
kubectl scale rs nginx-replicaset --replicas=5
ReplicaSet creates 2 more pods immediately

# Scenario: Node failure
Node1 fails (had 2 pods)
ReplicaSet reschedules those 2 pods to healthy nodes
```

## Deployments

**Deployments** provide declarative updates for pods and ReplicaSets. They're the recommended way to manage stateless applications.

### Creating a Deployment

```bash
# Imperative
kubectl create deployment nginx --image=nginx:1.25 --replicas=3

# View deployment
kubectl get deployments
kubectl get deploy  # Short name

# Expected output:
# NAME    READY   UP-TO-DATE   AVAILABLE   AGE
# nginx   3/3     3            3           1m
```

### Deployment YAML

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

```bash
# Create deployment
kubectl apply -f deployment.yaml

# Check deployment
kubectl get deploy nginx-deployment

# Check ReplicaSet (created automatically)
kubectl get rs

# Check pods
kubectl get pods

# Get all related resources
kubectl get deploy,rs,pods -l app=nginx
```

## Scaling

### Manual Scaling

```bash
# Scale using kubectl
kubectl scale deployment nginx-deployment --replicas=5

# Scale using YAML
kubectl edit deployment nginx-deployment
# Change replicas: 3 to replicas: 5
# Save and exit

# Or patch
kubectl patch deployment nginx-deployment -p '{"spec":{"replicas":5}}'

# Check scaling
kubectl get pods -w
```

### Horizontal Pod Autoscaler (HPA)

Automatically scales based on metrics.

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # Scale when CPU > 70%
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80  # Scale when memory > 80%
```

```bash
# Create HPA
kubectl apply -f hpa.yaml

# Or create imperatively
kubectl autoscale deployment nginx-deployment --cpu-percent=70 --min=2 --max=10

# View HPA
kubectl get hpa

# Expected output:
# NAME        REFERENCE                     TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
# nginx-hpa   Deployment/nginx-deployment   25%/70%         2         10        2          1m

# Watch HPA in action
kubectl get hpa -w

# Generate load to trigger scaling
kubectl run -it --rm load-generator --image=busybox -- /bin/sh
# In the shell:
while true; do wget -q -O- http://nginx-deployment; done

# In another terminal, watch pods scale up
kubectl get pods -w

# View HPA events
kubectl describe hpa nginx-hpa

# Delete HPA
kubectl delete hpa nginx-hpa
```

**Note**: HPA requires metrics-server to be installed:

```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For Minikube
minikube addons enable metrics-server

# Verify
kubectl top nodes
kubectl top pods
```

## Rolling Updates

Deployments support rolling updates - gradually replace pods with new version without downtime.

### Update Strategy

```yaml
# deployment-with-strategy.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 10
  strategy:
    type: RollingUpdate  # Default strategy
    rollingUpdate:
      maxUnavailable: 25%  # Max 25% pods can be unavailable during update
      maxSurge: 25%        # Max 25% extra pods during update
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
```

### Performing Rolling Update

```bash
# Current version
kubectl get deployment nginx-deployment -o wide
# Shows nginx:1.25

# Update to new version
kubectl set image deployment/nginx-deployment nginx=nginx:1.26

# Watch the rollout
kubectl rollout status deployment/nginx-deployment

# Expected output:
# Waiting for deployment "nginx-deployment" rollout to finish: 3 out of 10 new replicas have been updated...
# Waiting for deployment "nginx-deployment" rollout to finish: 3 out of 10 new replicas have been updated...
# Waiting for deployment "nginx-deployment" rollout to finish: 5 out of 10 new replicas have been updated...
# ...
# deployment "nginx-deployment" successfully rolled out

# Watch pods during update
kubectl get pods -w

# View rollout history
kubectl rollout history deployment/nginx-deployment

# Expected output:
# REVISION  CHANGE-CAUSE
# 1         <none>
# 2         kubectl set image deployment/nginx-deployment nginx=nginx:1.26
```

### Rolling Update Process

```
Starting state: 10 pods running v1.25

Step 1: Create 3 new pods (v1.26)  [maxSurge: 25% of 10 = 2.5 ≈ 3]
  v1.25: [Pod1][Pod2][Pod3][Pod4][Pod5][Pod6][Pod7][Pod8][Pod9][Pod10]
  v1.26: [Pod11][Pod12][Pod13]
  Total: 13 pods

Step 2: Wait for new pods to be Ready (health checks pass)

Step 3: Terminate 3 old pods  [maxUnavailable: 25%]
  v1.25: [Pod1][Pod2][Pod3][Pod4][Pod5][Pod6][Pod7]
  v1.26: [Pod11][Pod12][Pod13]
  Total: 10 pods

Step 4: Repeat until all pods are v1.26
  ...
  v1.25: []
  v1.26: [Pod11][Pod12][Pod13][Pod14][Pod15][Pod16][Pod17][Pod18][Pod19][Pod20]
  Total: 10 pods

Result: Zero downtime, gradual rollout
```

## Rollbacks

If update has issues, rollback to previous version.

```bash
# Something goes wrong after update
kubectl set image deployment/nginx-deployment nginx=nginx:broken-version

# Check rollout status
kubectl rollout status deployment/nginx-deployment

# Pods might be failing, check
kubectl get pods

# View rollout history
kubectl rollout history deployment/nginx-deployment

# Expected output:
# REVISION  CHANGE-CAUSE
# 1         <none>
# 2         kubectl set image deployment/nginx-deployment nginx=nginx:1.26
# 3         kubectl set image deployment/nginx-deployment nginx=nginx:broken-version

# Rollback to previous version
kubectl rollout undo deployment/nginx-deployment

# Rollback to specific revision
kubectl rollout undo deployment/nginx-deployment --to-revision=2

# Watch rollback
kubectl rollout status deployment/nginx-deployment

# Verify version
kubectl describe deployment nginx-deployment | grep Image

# Pause rollout (stop update in progress)
kubectl rollout pause deployment/nginx-deployment

# Resume rollout
kubectl rollout resume deployment/nginx-deployment
```

## Deployment Strategies

### 1. Rolling Update (Default)

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 1
```

- **Pros**: Zero downtime, gradual rollout, easy rollback
- **Cons**: Both versions run simultaneously (compatibility needed)
- **Use case**: Most applications

### 2. Recreate Strategy

```yaml
strategy:
  type: Recreate
```

```bash
# Process:
# 1. Delete all old pods
# 2. Create all new pods
# Downtime occurs between step 1 and 2
```

- **Pros**: Simple, no version compatibility issues
- **Cons**: Downtime during deployment
- **Use case**: Applications that can't run multiple versions simultaneously

### 3. Blue-Green Deployment

```yaml
# blue-deployment.yaml (current production)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
      - name: myapp
        image: myapp:v1.0

---
# green-deployment.yaml (new version)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
      - name: myapp
        image: myapp:v2.0

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
    version: blue  # Points to blue initially
  ports:
  - port: 80
    targetPort: 8080
```

```bash
# Step 1: Deploy blue (current) and green (new) versions
kubectl apply -f blue-deployment.yaml
kubectl apply -f green-deployment.yaml

# Step 2: Service points to blue (production traffic)
kubectl apply -f service.yaml

# Step 3: Test green deployment
kubectl port-forward deployment/myapp-green 8080:8080
# Test at localhost:8080

# Step 4: Switch traffic to green (instant cutover)
kubectl patch service myapp-service -p '{"spec":{"selector":{"version":"green"}}}'

# Step 5: If issues, instant rollback to blue
kubectl patch service myapp-service -p '{"spec":{"selector":{"version":"blue"}}}'

# Step 6: After green is stable, delete blue
kubectl delete deployment myapp-blue
```

- **Pros**: Instant cutover, instant rollback, full testing before switch
- **Cons**: Double resources needed
- **Use case**: Critical applications, major version changes

### 4. Canary Deployment

```yaml
# main-deployment.yaml (90% of traffic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-main
spec:
  replicas: 9
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        version: v1
    spec:
      containers:
      - name: myapp
        image: myapp:v1.0

---
# canary-deployment.yaml (10% of traffic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-canary
spec:
  replicas: 1  # 1 out of 10 pods = 10%
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
        version: v2
    spec:
      containers:
      - name: myapp
        image: myapp:v2.0

---
# service.yaml (load balances across all pods)
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp  # Matches both versions
  ports:
  - port: 80
    targetPort: 8080
```

```bash
# Step 1: Deploy main version (v1)
kubectl apply -f main-deployment.yaml

# Step 2: Deploy canary (v2) - 10% traffic
kubectl apply -f canary-deployment.yaml

# Step 3: Monitor canary metrics
kubectl logs -l app=myapp,version=v2 -f

# Step 4a: If canary looks good, gradually increase
kubectl scale deployment myapp-canary --replicas=3  # 30% traffic
kubectl scale deployment myapp-canary --replicas=5  # 50% traffic

# Step 4b: Eventually replace main with canary
kubectl set image deployment/myapp-main myapp=myapp:v2.0
kubectl delete deployment myapp-canary

# Alternative: If canary has issues, delete it
kubectl delete deployment myapp-canary
```

- **Pros**: Safe, gradual rollout, real traffic testing, minimal risk
- **Cons**: Complex monitoring, longer deployment time
- **Use case**: High-risk changes, large user base

## Labels and Selectors

Deployments use labels to manage pods.

```yaml
# Labels in deployment
spec:
  selector:
    matchLabels:        # Deployment finds pods with these labels
      app: nginx
      tier: frontend
  template:
    metadata:
      labels:           # Pods created with these labels
        app: nginx
        tier: frontend
        environment: production
```

```bash
# Get pods by label
kubectl get pods -l app=nginx
kubectl get pods -l app=nginx,tier=frontend
kubectl get pods -l environment=production

# Get pods with label expression
kubectl get pods -l 'app in (nginx, apache)'
kubectl get pods -l 'environment!=production'

# Add label to pod
kubectl label pod nginx-pod version=v1

# Update label
kubectl label pod nginx-pod version=v2 --overwrite

# Remove label
kubectl label pod nginx-pod version-

# Show labels
kubectl get pods --show-labels

# Label columns
kubectl get pods -L app -L version
```

## Key Takeaways

- **ReplicaSet** ensures N pod replicas are always running
- **Deployment** manages ReplicaSets and provides declarative updates
- **Scaling**: Manual (kubectl scale) or automatic (HPA)
- **Rolling updates**: Gradual replacement, zero downtime
- **Rollbacks**: Easy recovery from failed deployments
- **Strategies**: RollingUpdate (default), Recreate, Blue-Green, Canary
- **Labels**: Key mechanism for pod selection and organization

## What's Next

In Part 6, we'll explore **Services and Networking**:
- ClusterIP, NodePort, LoadBalancer service types
- Service discovery and DNS
- Ingress controllers for HTTP routing
- Network policies for security
- Understanding kube-proxy and iptables

Deployments manage pods, Services make them accessible!
