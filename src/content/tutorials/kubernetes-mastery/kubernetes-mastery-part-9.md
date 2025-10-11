---
title: "Kubernetes Mastery Part 9: Advanced Topics"
description: "Master advanced Kubernetes features including Ingress controllers, StatefulSets, DaemonSets, Jobs, CronJobs, resource quotas, and pod scheduling."
publishDate: 2025-10-11
publishedAt: 2025-10-11
tags: ["kubernetes", "ingress", "jobs", "cronjobs", "daemonsets", "advanced", "scheduling"]
difficulty: "advanced"
series: "Kubernetes Mastery"
part: 9
estimatedTime: "90 minutes"
totalParts: 10
---

# Part 9: Advanced Topics

## Introduction

This part covers advanced Kubernetes features that are essential for production environments: Ingress for HTTP/HTTPS routing, workload types for specialized tasks, resource management, and advanced scheduling patterns.

## Ingress and Ingress Controllers

Ingress provides HTTP and HTTPS routing to services within a cluster.

### Installing NGINX Ingress Controller

```bash
# Install using Helm
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# Or using kubectl
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Wait for the controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Get the external IP
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

### Basic Ingress

```yaml
# basic-ingress.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
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

```bash
# Apply the resources
kubectl apply -f basic-ingress.yaml

# Get ingress details
kubectl get ingress web-ingress
kubectl describe ingress web-ingress

# Test (add example.com to /etc/hosts pointing to ingress IP)
INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "$INGRESS_IP example.com" | sudo tee -a /etc/hosts

curl http://example.com
```

### Path-Based Routing

```yaml
# path-based-ingress.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: hashicorp/http-echo
        args:
        - -text=API Service
        ports:
        - containerPort: 5678
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 5678
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: hashicorp/http-echo
        args:
        - -text=Frontend Service
        ports:
        - containerPort: 5678
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 5678
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

```bash
# Apply and test
kubectl apply -f path-based-ingress.yaml

# Add to /etc/hosts
echo "$INGRESS_IP myapp.com" | sudo tee -a /etc/hosts

# Test different paths
curl http://myapp.com/
curl http://myapp.com/api
```

### Host-Based Routing

```yaml
# host-based-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-host-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
  - host: web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

```bash
# Apply
kubectl apply -f host-based-ingress.yaml

# Add hosts
echo "$INGRESS_IP api.example.com web.example.com" | sudo tee -a /etc/hosts

# Test
curl http://api.example.com
curl http://web.example.com
```

### TLS/SSL with Ingress

```bash
# Create TLS certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key \
  -out tls.crt \
  -subj "/CN=secure.example.com/O=MyCompany"

# Create Kubernetes secret
kubectl create secret tls tls-secret \
  --cert=tls.crt \
  --key=tls.key

# Clean up local files
rm tls.key tls.crt
```

```yaml
# tls-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - secure.example.com
    secretName: tls-secret
  rules:
  - host: secure.example.com
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

```bash
# Apply
kubectl apply -f tls-ingress.yaml

# Add host
echo "$INGRESS_IP secure.example.com" | sudo tee -a /etc/hosts

# Test HTTPS
curl -k https://secure.example.com

# Test HTTP redirect
curl -I http://secure.example.com
```

### Advanced Ingress Annotations

```yaml
# advanced-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: advanced-ingress
  annotations:
    # Rate limiting
    nginx.ingress.kubernetes.io/limit-rps: "10"
    nginx.ingress.kubernetes.io/limit-connections: "10"

    # CORS
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"

    # Authentication
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: basic-auth
    nginx.ingress.kubernetes.io/auth-realm: "Authentication Required"

    # Timeouts
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"

    # Body size
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"

    # Custom headers
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header X-Custom-Header "MyValue" always;
spec:
  ingressClassName: nginx
  rules:
  - host: advanced.example.com
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

```bash
# Create basic auth secret
htpasswd -cb auth admin password
kubectl create secret generic basic-auth --from-file=auth
rm auth

# Apply ingress
kubectl apply -f advanced-ingress.yaml
```

## DaemonSets

DaemonSets ensure a copy of a pod runs on all (or selected) nodes.

```yaml
# daemonset-logging.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-collector
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: log-collector
  template:
    metadata:
      labels:
        app: log-collector
    spec:
      tolerations:
      # Run on control plane nodes too
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule
      containers:
      - name: fluentd
        image: fluent/fluentd:v1.16-1
        resources:
          limits:
            memory: 200Mi
            cpu: 100m
          requests:
            memory: 100Mi
            cpu: 50m
        volumeMounts:
        - name: varlog
          mountPath: /var/log
          readOnly: true
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      terminationGracePeriodSeconds: 30
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

```bash
# Apply DaemonSet
kubectl apply -f daemonset-logging.yaml

# Check pods on each node
kubectl get pods -n kube-system -l app=log-collector -o wide

# Update DaemonSet
kubectl set image daemonset/log-collector -n kube-system fluentd=fluent/fluentd:v1.17-1

# Watch rollout
kubectl rollout status daemonset/log-collector -n kube-system

# View DaemonSet details
kubectl describe daemonset log-collector -n kube-system
```

### DaemonSet with Node Selector

```yaml
# daemonset-selective.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: monitoring-agent
spec:
  selector:
    matchLabels:
      app: monitoring
  template:
    metadata:
      labels:
        app: monitoring
    spec:
      nodeSelector:
        monitoring: "true"
      containers:
      - name: node-exporter
        image: prom/node-exporter:latest
        ports:
        - containerPort: 9100
          name: metrics
```

```bash
# Label nodes for monitoring
kubectl label nodes worker-1 monitoring=true
kubectl label nodes worker-2 monitoring=true

# Apply DaemonSet
kubectl apply -f daemonset-selective.yaml

# Check deployment
kubectl get pods -l app=monitoring -o wide
```

## Jobs

Jobs create one or more pods and ensure they successfully terminate.

### Basic Job

```yaml
# job-basic.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-processor
spec:
  template:
    metadata:
      name: data-processor
    spec:
      containers:
      - name: processor
        image: busybox:latest
        command: ["sh", "-c", "echo Processing data... && sleep 10 && echo Done!"]
      restartPolicy: Never
  backoffLimit: 4
```

```bash
# Create job
kubectl apply -f job-basic.yaml

# Watch job
kubectl get jobs -w

# View pods
kubectl get pods -l job-name=data-processor

# Check logs
kubectl logs -l job-name=data-processor

# View job details
kubectl describe job data-processor

# Delete job
kubectl delete job data-processor
```

### Parallel Jobs

```yaml
# job-parallel.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: parallel-job
spec:
  parallelism: 3        # Run 3 pods in parallel
  completions: 9        # Total 9 successful completions needed
  template:
    metadata:
      name: worker
    spec:
      containers:
      - name: worker
        image: busybox:latest
        command: ["sh", "-c", "echo Processing task $RANDOM && sleep 5"]
      restartPolicy: Never
  backoffLimit: 10
```

```bash
# Create parallel job
kubectl apply -f job-parallel.yaml

# Watch pods being created
kubectl get pods -l job-name=parallel-job -w

# Monitor job progress
kubectl get job parallel-job -w
```

### Job with Indexed Completion

```yaml
# job-indexed.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: indexed-job
spec:
  completions: 5
  parallelism: 2
  completionMode: Indexed
  template:
    spec:
      containers:
      - name: worker
        image: busybox:latest
        command:
        - sh
        - -c
        - |
          echo "Processing index: $JOB_COMPLETION_INDEX"
          sleep 5
          echo "Completed index: $JOB_COMPLETION_INDEX"
      restartPolicy: Never
```

```bash
# Create indexed job
kubectl apply -f job-indexed.yaml

# Watch indexed completions
kubectl get pods -l job-name=indexed-job -w

# Check logs for each index
for pod in $(kubectl get pods -l job-name=indexed-job -o name); do
  echo "=== $pod ==="
  kubectl logs $pod
done
```

## CronJobs

CronJobs create jobs on a time-based schedule.

### Basic CronJob

```yaml
# cronjob-basic.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup-job
spec:
  schedule: "0 2 * * *"  # Every day at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: busybox:latest
            command:
            - sh
            - -c
            - |
              echo "Starting backup at $(date)"
              echo "Backing up data..."
              sleep 10
              echo "Backup completed at $(date)"
          restartPolicy: OnFailure
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
```

```bash
# Create CronJob
kubectl apply -f cronjob-basic.yaml

# View CronJob
kubectl get cronjobs

# Manually trigger job
kubectl create job --from=cronjob/backup-job manual-backup

# View jobs created by CronJob
kubectl get jobs

# View CronJob history
kubectl describe cronjob backup-job
```

### CronJob Schedules

```yaml
# cronjob-schedules.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hourly-report
spec:
  schedule: "0 * * * *"  # Every hour
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: reporter
            image: busybox:latest
            command: ["sh", "-c", "date; echo Generating hourly report"]
          restartPolicy: OnFailure
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: weekly-cleanup
spec:
  schedule: "0 3 * * 0"  # Every Sunday at 3 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cleanup
            image: busybox:latest
            command: ["sh", "-c", "echo Performing weekly cleanup"]
          restartPolicy: OnFailure
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: every-15-minutes
spec:
  schedule: "*/15 * * * *"  # Every 15 minutes
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: monitor
            image: busybox:latest
            command: ["sh", "-c", "echo Health check"]
          restartPolicy: OnFailure
```

### CronJob with Concurrency Policy

```yaml
# cronjob-concurrency.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: slow-job
spec:
  schedule: "*/5 * * * *"
  concurrencyPolicy: Forbid  # Allow, Forbid, Replace
  startingDeadlineSeconds: 100
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: worker
            image: busybox:latest
            command: ["sh", "-c", "echo Starting long task; sleep 300; echo Done"]
          restartPolicy: OnFailure
```

## Resource Quotas and LimitRanges

### ResourceQuota

```yaml
# resourcequota.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: team-a
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-a-quota
  namespace: team-a
spec:
  hard:
    # Compute resources
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi

    # Storage
    requests.storage: 100Gi
    persistentvolumeclaims: "10"

    # Object counts
    pods: "50"
    services: "20"
    configmaps: "20"
    secrets: "20"
    replicationcontrollers: "10"
```

```bash
# Apply ResourceQuota
kubectl apply -f resourcequota.yaml

# View quota
kubectl get resourcequota -n team-a
kubectl describe resourcequota team-a-quota -n team-a

# Try to exceed quota
kubectl run test --image=nginx -n team-a --requests=cpu=100
# Should fail with quota exceeded error
```

### LimitRange

```yaml
# limitrange.yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: resource-limits
  namespace: team-a
spec:
  limits:
  # Pod limits
  - type: Pod
    max:
      cpu: "4"
      memory: 8Gi
    min:
      cpu: "100m"
      memory: 128Mi

  # Container limits
  - type: Container
    max:
      cpu: "2"
      memory: 4Gi
    min:
      cpu: "50m"
      memory: 64Mi
    default:
      cpu: "500m"
      memory: 512Mi
    defaultRequest:
      cpu: "100m"
      memory: 128Mi
    maxLimitRequestRatio:
      cpu: "10"
      memory: "2"

  # PVC limits
  - type: PersistentVolumeClaim
    max:
      storage: 50Gi
    min:
      storage: 1Gi
```

```bash
# Apply LimitRange
kubectl apply -f limitrange.yaml

# View LimitRange
kubectl describe limitrange resource-limits -n team-a

# Create pod without resource requests (uses defaults)
kubectl run default-pod --image=nginx -n team-a

# Check assigned resources
kubectl get pod default-pod -n team-a -o yaml | grep -A 10 resources:
```

## Pod Disruption Budgets

Ensure availability during voluntary disruptions (node upgrades, drains).

```yaml
# pdb.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: critical-app
spec:
  replicas: 5
  selector:
    matchLabels:
      app: critical
  template:
    metadata:
      labels:
        app: critical
    spec:
      containers:
      - name: app
        image: nginx:alpine
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: critical-app-pdb
spec:
  minAvailable: 3  # Or maxUnavailable: 2
  selector:
    matchLabels:
      app: critical
```

```bash
# Apply resources
kubectl apply -f pdb.yaml

# View PDB
kubectl get pdb
kubectl describe pdb critical-app-pdb

# Try to drain a node (will respect PDB)
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
```

## Affinity and Anti-Affinity

### Node Affinity

```yaml
# node-affinity.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gpu-workload
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gpu-app
  template:
    metadata:
      labels:
        app: gpu-app
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: gpu
                operator: In
                values:
                - "true"
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 1
            preference:
              matchExpressions:
              - key: gpu-type
                operator: In
                values:
                - nvidia-a100
      containers:
      - name: app
        image: nvidia/cuda:11.8.0-base-ubuntu22.04
```

```bash
# Label nodes
kubectl label nodes worker-1 gpu=true
kubectl label nodes worker-1 gpu-type=nvidia-a100

# Apply deployment
kubectl apply -f node-affinity.yaml

# Verify pod placement
kubectl get pods -l app=gpu-app -o wide
```

### Pod Affinity

```yaml
# pod-affinity.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:alpine
---
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
      affinity:
        podAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - redis
            topologyKey: kubernetes.io/hostname
      containers:
      - name: web
        image: nginx:alpine
```

### Pod Anti-Affinity

```yaml
# pod-anti-affinity.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ha-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ha-app
  template:
    metadata:
      labels:
        app: ha-app
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - ha-app
            topologyKey: kubernetes.io/hostname
      containers:
      - name: app
        image: nginx:alpine
```

```bash
# Apply deployment
kubectl apply -f pod-anti-affinity.yaml

# Verify pods are on different nodes
kubectl get pods -l app=ha-app -o wide
```

## Taints and Tolerations

```bash
# Add taint to node
kubectl taint nodes worker-1 dedicated=gpu:NoSchedule

# View node taints
kubectl describe node worker-1 | grep Taints
```

```yaml
# toleration.yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  tolerations:
  - key: dedicated
    operator: Equal
    value: gpu
    effect: NoSchedule
  containers:
  - name: app
    image: nvidia/cuda:11.8.0-base-ubuntu22.04
```

```bash
# Apply pod
kubectl apply -f toleration.yaml

# Remove taint
kubectl taint nodes worker-1 dedicated=gpu:NoSchedule-
```

## Priority Classes

```yaml
# priorityclass.yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000000
globalDefault: false
description: "High priority for critical workloads"
---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: low-priority
value: 1000
globalDefault: false
description: "Low priority for batch jobs"
---
apiVersion: v1
kind: Pod
metadata:
  name: critical-pod
spec:
  priorityClassName: high-priority
  containers:
  - name: app
    image: nginx:alpine
```

```bash
# Apply priority classes
kubectl apply -f priorityclass.yaml

# View priority classes
kubectl get priorityclasses
```

## Summary

In this part, you learned:

- Ingress and NGINX Ingress Controller setup
- Path-based and host-based routing
- TLS/SSL termination with Ingress
- DaemonSets for node-level services
- Jobs and parallel job processing
- CronJobs for scheduled tasks
- Resource Quotas and LimitRanges
- Pod Disruption Budgets for high availability
- Node affinity, pod affinity, and anti-affinity
- Taints, tolerations, and priority classes

**Key Commands:**

```bash
# Ingress
kubectl get ingress
kubectl describe ingress <name>

# DaemonSets
kubectl get daemonsets
kubectl rollout status daemonset <name>

# Jobs
kubectl get jobs
kubectl create job --from=cronjob/<name> <job-name>

# CronJobs
kubectl get cronjobs
kubectl describe cronjob <name>

# Resource quotas
kubectl get resourcequota -n <namespace>
kubectl describe resourcequota <name> -n <namespace>

# PDB
kubectl get pdb
kubectl describe pdb <name>
```

In Part 10, we'll cover monitoring, logging, security best practices, and production readiness.
