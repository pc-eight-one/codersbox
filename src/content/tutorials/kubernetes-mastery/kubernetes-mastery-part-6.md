---
title: "Kubernetes Mastery Part 6: Services and Networking"
description: "Master Kubernetes networking with services, service discovery, DNS, network policies, and kube-proxy modes for production-grade cluster communication."
publishDate: 2025-10-11
publishedAt: 2025-10-11
tags: ["kubernetes", "networking", "services", "dns", "network-policies", "devops"]
difficulty: "intermediate"
series: "Kubernetes Mastery"
part: 6
estimatedTime: "75 minutes"
totalParts: 10
---

# Part 6: Services and Networking

## Introduction

Kubernetes networking is one of the most critical aspects of cluster operation. Services provide stable endpoints for accessing pods, while network policies control traffic flow between them. In this part, we'll explore the complete networking stack.

## Understanding Kubernetes Networking Model

Kubernetes follows a flat networking model with these requirements:

1. **All pods can communicate with all other pods** without NAT
2. **All nodes can communicate with all pods** without NAT
3. **The IP a pod sees itself as** is the same IP others see it as

## Service Types

### 1. ClusterIP (Default)

ClusterIP exposes the service on an internal IP within the cluster.

**Create a deployment for testing:**

```bash
kubectl create deployment web --image=nginx:latest --replicas=3
```

**Create a ClusterIP service:**

```yaml
# clusterip-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - protocol: TCP
      port: 80        # Service port
      targetPort: 80  # Container port
```

```bash
# Apply the service
kubectl apply -f clusterip-service.yaml

# View the service
kubectl get svc web-service

# Describe to see endpoints
kubectl describe svc web-service

# Test from within cluster
kubectl run test-pod --image=busybox:latest -it --rm --restart=Never -- wget -qO- http://web-service
```

### 2. NodePort

NodePort exposes the service on each node's IP at a static port (30000-32767).

```yaml
# nodeport-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30080  # Optional: auto-assign if omitted
```

```bash
# Apply the service
kubectl apply -f nodeport-service.yaml

# Get the service details
kubectl get svc web-nodeport

# Access from outside cluster (replace with your node IP)
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
curl http://$NODE_IP:30080
```

### 3. LoadBalancer

LoadBalancer exposes the service externally using a cloud provider's load balancer.

```yaml
# loadbalancer-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-loadbalancer
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

```bash
# Apply the service
kubectl apply -f loadbalancer-service.yaml

# Watch for external IP assignment (may take a minute)
kubectl get svc web-loadbalancer -w

# Access via external IP
EXTERNAL_IP=$(kubectl get svc web-loadbalancer -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl http://$EXTERNAL_IP
```

**Note:** On local clusters (minikube, kind), use `minikube tunnel` or MetalLB.

### 4. ExternalName

ExternalName maps a service to a DNS name (no proxying).

```yaml
# externalname-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: external-database
spec:
  type: ExternalName
  externalName: my-database.example.com
```

```bash
# Apply the service
kubectl apply -f externalname-service.yaml

# Pods can now access my-database.example.com via:
# external-database.default.svc.cluster.local
```

## Service Discovery and DNS

Kubernetes provides automatic DNS-based service discovery.

### DNS Naming Convention

```
<service-name>.<namespace>.svc.cluster.local
```

**Examples:**

```bash
# Create services in different namespaces
kubectl create namespace production
kubectl create namespace development

# Create service in production
kubectl create deployment api --image=nginx -n production
kubectl expose deployment api --port=80 --name=api-service -n production

# Create service in development
kubectl create deployment api --image=nginx -n development
kubectl expose deployment api --port=80 --name=api-service -n development
```

**Testing DNS resolution:**

```bash
# From a pod in default namespace
kubectl run dns-test --image=busybox:latest -it --rm --restart=Never -- nslookup api-service.production.svc.cluster.local

# Within same namespace, short name works
kubectl run dns-test --image=busybox:latest -it --rm --restart=Never -n production -- nslookup api-service

# Cross-namespace requires full name
kubectl run dns-test --image=busybox:latest -it --rm --restart=Never -n development -- wget -qO- http://api-service.production.svc.cluster.local
```

### CoreDNS Configuration

```bash
# View CoreDNS ConfigMap
kubectl get configmap coredns -n kube-system -o yaml

# View CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns

# Test DNS resolution
kubectl run dns-debug --image=nicolaka/netshoot -it --rm --restart=Never -- dig kubernetes.default.svc.cluster.local
```

## Endpoints and EndpointSlices

Services automatically create Endpoints that track pod IPs.

```bash
# View endpoints for a service
kubectl get endpoints web-service

# Detailed view
kubectl describe endpoints web-service

# View as YAML
kubectl get endpoints web-service -o yaml
```

**Manual Endpoints (for external services):**

```yaml
# external-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: external-api
spec:
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
---
apiVersion: v1
kind: Endpoints
metadata:
  name: external-api  # Must match service name
subsets:
  - addresses:
      - ip: 192.168.1.100
      - ip: 192.168.1.101
    ports:
      - port: 80
```

**EndpointSlices (newer, more scalable):**

```bash
# View EndpointSlices
kubectl get endpointslices

# Describe an EndpointSlice
kubectl describe endpointslice <name>
```

## Headless Services

Headless services (ClusterIP: None) return pod IPs directly instead of a single service IP.

```yaml
# headless-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-headless
spec:
  clusterIP: None  # Makes it headless
  selector:
    app: web
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

```bash
# Apply the service
kubectl apply -f headless-service.yaml

# DNS returns all pod IPs
kubectl run dns-test --image=busybox:latest -it --rm --restart=Never -- nslookup web-headless

# You'll see multiple A records, one for each pod
```

**Use cases for headless services:**
- StatefulSets (stable network identities)
- Service mesh implementations
- Custom load balancing logic

## Network Policies

Network policies control traffic flow at the IP address or port level.

### Prerequisites

```bash
# Check if your CNI supports network policies
# Calico, Cilium, Weave Net support them
# Flannel does NOT support network policies

# Install Calico (if needed)
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
```

### Default Deny All Traffic

```yaml
# deny-all.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: default
spec:
  podSelector: {}  # Selects all pods
  policyTypes:
    - Ingress
    - Egress
```

```bash
# Apply the policy
kubectl apply -f deny-all.yaml

# Test - traffic should be blocked
kubectl run test --image=nginx
kubectl run client --image=busybox -it --rm --restart=Never -- wget -qO- --timeout=2 http://test
# Should timeout
```

### Allow Specific Ingress Traffic

```yaml
# allow-frontend.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 80
```

### Allow from Specific Namespace

```yaml
# allow-from-namespace.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-from-production
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              environment: production
      ports:
        - protocol: TCP
          port: 8080
```

### Allow Egress to Specific Service

```yaml
# allow-egress-dns.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-egress
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
      ports:
        - protocol: UDP
          port: 53
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - protocol: TCP
          port: 5432
```

### Complex Network Policy Example

```yaml
# complex-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
      tier: backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    # Allow from frontend pods
    - from:
        - podSelector:
            matchLabels:
              app: frontend
        - namespaceSelector:
            matchLabels:
              environment: production
      ports:
        - protocol: TCP
          port: 8080
    # Allow from monitoring namespace
    - from:
        - namespaceSelector:
            matchLabels:
              name: monitoring
      ports:
        - protocol: TCP
          port: 9090
  egress:
    # Allow DNS
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
      ports:
        - protocol: UDP
          port: 53
    # Allow to database
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    # Allow to external API (CIDR)
    - to:
        - ipBlock:
            cidr: 203.0.113.0/24
      ports:
        - protocol: TCP
          port: 443
```

```bash
# Apply and test network policies
kubectl apply -f complex-policy.yaml

# View all network policies
kubectl get networkpolicy

# Describe a policy
kubectl describe networkpolicy api-network-policy -n production

# Test connectivity
kubectl run frontend --image=busybox -it --rm --restart=Never --labels="app=frontend" -- wget -qO- http://api:8080
```

## Kube-Proxy Modes

Kube-proxy maintains network rules on nodes for service routing.

### 1. iptables Mode (Default)

```bash
# Check current mode
kubectl logs -n kube-system -l k8s-app=kube-proxy | grep "Using iptables Proxier"

# View iptables rules (on node)
sudo iptables -t nat -L | grep -i kubernetes

# View service chain
sudo iptables -t nat -L KUBE-SERVICES
```

**Characteristics:**
- Most common mode
- Uses iptables NAT rules
- Random pod selection
- Good performance for most clusters

### 2. IPVS Mode

IPVS (IP Virtual Server) provides better performance for large clusters.

```bash
# Enable IPVS mode
# Edit kube-proxy ConfigMap
kubectl edit configmap kube-proxy -n kube-system

# Change mode to "ipvs"
# mode: "ipvs"

# Install IPVS tools on nodes
sudo apt-get update
sudo apt-get install -y ipvsadm ipset

# Load IPVS modules
sudo modprobe ip_vs
sudo modprobe ip_vs_rr
sudo modprobe ip_vs_wrr
sudo modprobe ip_vs_sh

# Restart kube-proxy pods
kubectl delete pod -n kube-system -l k8s-app=kube-proxy

# View IPVS rules
sudo ipvsadm -ln

# View IPVS statistics
sudo ipvsadm -ln --stats
```

**IPVS Scheduling Algorithms:**
- `rr` - Round Robin (default)
- `lc` - Least Connection
- `dh` - Destination Hashing
- `sh` - Source Hashing
- `wrr` - Weighted Round Robin

## Practical Exercises

### Exercise 1: Multi-Tier Application with Services

```yaml
# multi-tier-app.yaml
---
# Database Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
        tier: database
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_PASSWORD
          value: mysecretpassword
        ports:
        - containerPort: 5432
---
# Database Service (ClusterIP)
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
---
# Backend API Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
        tier: backend
    spec:
      containers:
      - name: api
        image: nginx:alpine
        ports:
        - containerPort: 80
---
# Backend API Service (ClusterIP)
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 80
---
# Frontend Deployment
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
        tier: frontend
    spec:
      containers:
      - name: frontend
        image: nginx:alpine
        ports:
        - containerPort: 80
---
# Frontend Service (LoadBalancer)
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: LoadBalancer
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

```bash
# Deploy the application
kubectl apply -f multi-tier-app.yaml

# View all resources
kubectl get all

# Test internal connectivity
kubectl run test --image=busybox -it --rm --restart=Never -- wget -qO- http://api:8080
kubectl run test --image=busybox -it --rm --restart=Never -- nc -zv postgres 5432

# View service endpoints
kubectl get endpoints

# Access frontend externally
kubectl get svc frontend
```

### Exercise 2: Service Discovery and DNS

```bash
# Create test environment
kubectl create deployment echo1 --image=hashicorp/http-echo --replicas=2 -- -text="Echo Server 1"
kubectl create deployment echo2 --image=hashicorp/http-echo --replicas=2 -- -text="Echo Server 2"

kubectl expose deployment echo1 --port=5678 --name=echo1-svc
kubectl expose deployment echo2 --port=5678 --name=echo2-svc

# Test DNS resolution
kubectl run dns-test --image=nicolaka/netshoot -it --rm --restart=Never -- /bin/bash

# Inside the pod:
# nslookup echo1-svc
# nslookup echo2-svc
# dig echo1-svc.default.svc.cluster.local
# curl http://echo1-svc:5678
# curl http://echo2-svc:5678
```

### Exercise 3: Network Policy Implementation

```bash
# Create namespaces
kubectl create namespace frontend
kubectl create namespace backend
kubectl create namespace database

# Label namespaces
kubectl label namespace frontend tier=frontend
kubectl label namespace backend tier=backend
kubectl label namespace database tier=database

# Deploy services
kubectl create deployment web -n frontend --image=nginx --replicas=2
kubectl create deployment api -n backend --image=nginx --replicas=2
kubectl create deployment db -n database --image=postgres --replicas=1

kubectl expose deployment web -n frontend --port=80
kubectl expose deployment api -n backend --port=80
kubectl expose deployment db -n database --port=5432
```

```yaml
# network-policies.yaml
---
# Deny all traffic in database namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: database
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
---
# Allow backend to database
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-backend
  namespace: database
spec:
  podSelector:
    matchLabels:
      app: db
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              tier: backend
      ports:
        - protocol: TCP
          port: 5432
---
# Allow frontend to backend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
  namespace: backend
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              tier: frontend
      ports:
        - protocol: TCP
          port: 80
```

```bash
# Apply policies
kubectl apply -f network-policies.yaml

# Test connectivity
kubectl run test -n frontend --image=busybox -it --rm --restart=Never -- wget -qO- http://api.backend:80
kubectl run test -n backend --image=busybox -it --rm --restart=Never -- nc -zv db.database 5432
kubectl run test -n frontend --image=busybox -it --rm --restart=Never -- nc -zv db.database 5432
# This should fail - frontend cannot reach database
```

## Debugging Network Issues

```bash
# Check service endpoints
kubectl get endpoints <service-name>

# Check if pods are selected by service
kubectl get pods -l app=<label>

# Verify DNS resolution
kubectl run dns-debug --image=nicolaka/netshoot -it --rm --restart=Never -- nslookup <service-name>

# Check network connectivity
kubectl run netshoot --image=nicolaka/netshoot -it --rm --restart=Never -- /bin/bash
# Inside pod:
# ping <service-name>
# curl -v http://<service-name>:<port>
# traceroute <service-name>
# tcpdump -i any port <port>

# View service proxy
kubectl get svc <service-name> -o yaml

# Check kube-proxy logs
kubectl logs -n kube-system -l k8s-app=kube-proxy

# View iptables rules (on node)
sudo iptables -t nat -L -n -v | grep <service-name>

# Test from specific namespace
kubectl run test -n <namespace> --image=busybox -it --rm --restart=Never -- wget -qO- http://<service>.<namespace>:80
```

## Best Practices

1. **Service Design:**
   - Use ClusterIP for internal services
   - Use LoadBalancer sparingly (cloud cost)
   - Name services clearly and consistently
   - Document port mappings

2. **Network Policies:**
   - Start with deny-all, then allow specific traffic
   - Apply at namespace level for consistency
   - Test policies thoroughly before production
   - Document allowed traffic flows

3. **DNS:**
   - Use short names within same namespace
   - Use FQDN for cross-namespace communication
   - Monitor CoreDNS for issues
   - Consider caching for high-traffic scenarios

4. **Performance:**
   - Use IPVS for large clusters (>1000 services)
   - Monitor service endpoint count
   - Use headless services when appropriate
   - Consider service mesh for complex routing

## Summary

In this part, you learned:

- Service types (ClusterIP, NodePort, LoadBalancer, ExternalName)
- Service discovery and DNS resolution patterns
- Endpoints and EndpointSlices management
- Headless services for direct pod access
- Network policies for security and traffic control
- Kube-proxy modes (iptables vs IPVS)
- Multi-tier application networking patterns

**Key Commands:**

```bash
# Service operations
kubectl expose deployment <name> --port=<port>
kubectl get svc
kubectl describe svc <name>
kubectl get endpoints <service>

# DNS testing
kubectl run dns-test --image=busybox -it --rm -- nslookup <service>

# Network policies
kubectl get networkpolicy
kubectl describe networkpolicy <name>

# Debugging
kubectl run netshoot --image=nicolaka/netshoot -it --rm -- /bin/bash
```

In Part 7, we'll explore ConfigMaps and Secrets for configuration management and sensitive data handling.
