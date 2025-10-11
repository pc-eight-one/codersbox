---
title: "Kubernetes Mastery - Part 3: Kubernetes Architecture and Core Concepts"
description: "Deep dive into Kubernetes architecture: understand the Control Plane, Worker Nodes, etcd, API Server, Scheduler, Controller Manager, kubelet, and how all components work together to manage your containerized applications."
publishDate: 2025-10-11
publishedAt: 2025-10-11
tags: ["Kubernetes", "Architecture", "Control Plane", "etcd", "API Server", "kubelet"]
difficulty: "intermediate"
series: "Kubernetes Mastery"
part: 3
estimatedTime: "75 minutes"
totalParts: 10
---

# Kubernetes Mastery - Part 3: Kubernetes Architecture and Core Concepts

Now that you have Kubernetes installed, let's understand how it actually works. In this tutorial, we'll explore the architecture of Kubernetes, diving deep into each component and how they interact to manage your containerized applications.

## Kubernetes Architecture Overview

Kubernetes follows a **client-server architecture** with a **distributed system** design. The cluster is divided into two main parts:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Control Plane (Master Node)                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │   API    │  │Controller│  │Scheduler │  │   etcd   │  │ │
│  │  │  Server  │  │ Manager  │  │          │  │          │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ▲                                  │
│                              │ (API calls)                      │
│                              │                                  │
│  ┌───────────────────────┐  │  ┌───────────────────────┐      │
│  │   Worker Node 1       │  │  │   Worker Node 2       │      │
│  │  ┌─────────────────┐  │  │  │  ┌─────────────────┐  │      │
│  │  │    kubelet      │──┼──┘  │  │    kubelet      │  │      │
│  │  ├─────────────────┤  │     │  ├─────────────────┤  │      │
│  │  │   kube-proxy    │  │     │  │   kube-proxy    │  │      │
│  │  ├─────────────────┤  │     │  ├─────────────────┤  │      │
│  │  │Container Runtime│  │     │  │Container Runtime│  │      │
│  │  ├─────────────────┤  │     │  ├─────────────────┤  │      │
│  │  │  Pod  │  Pod    │  │     │  │  Pod  │  Pod    │  │      │
│  │  └───────┴─────────┘  │     │  └───────┴─────────┘  │      │
│  └───────────────────────┘     └───────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Two Main Parts

1. **Control Plane** (Master Node): The brains of the operation - makes decisions about the cluster
2. **Worker Nodes**: The workers - run your actual application containers

---

## Part 1: Control Plane Components

The Control Plane is responsible for maintaining the desired state of the cluster. It makes global decisions about the cluster (scheduling, detecting and responding to events).

### 1. API Server (kube-apiserver)

**The front door to Kubernetes.**

#### What It Does

```
┌──────────────────────────────────────────────┐
│           Kubernetes API Server              │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  RESTful API Interface                 │ │
│  │  (HTTP/HTTPS endpoints)                │ │
│  └────────────────────────────────────────┘ │
│              ▲          ▲          ▲         │
│              │          │          │         │
└──────────────┼──────────┼──────────┼─────────┘
               │          │          │
         ┌─────┘    ┌─────┘    └─────┐
         │          │                 │
    ┌────▼───┐  ┌──▼──────┐  ┌──────▼────┐
    │kubectl │  │Dashboard│  │Controller │
    │        │  │         │  │ Manager   │
    └────────┘  └─────────┘  └───────────┘

All cluster communication goes through API Server
```

#### Key Responsibilities

- **Entry Point**: All interactions with cluster go through API server
- **Authentication**: Verifies who you are
- **Authorization**: Checks what you're allowed to do
- **Validation**: Ensures requests are valid
- **etcd Gateway**: Only component that talks to etcd directly
- **RESTful API**: Provides HTTP API for all resources

#### Practical Example

```bash
# When you run this command:
kubectl get pods

# What happens internally:
# 1. kubectl reads ~/.kube/config for cluster info
# 2. kubectl sends HTTPS GET request to API server
# 3. API server authenticates you (via certificate)
# 4. API server authorizes you (checks RBAC permissions)
# 5. API server queries etcd for pod data
# 6. API server returns pod list to kubectl
# 7. kubectl formats and displays the output
```

#### Check API Server

```bash
# Check if API server is running
kubectl get pods -n kube-system | grep apiserver
```

Expected output:
```
kube-apiserver-k8s-master   1/1   Running   0   2d
```

```bash
# View API server logs
kubectl logs -n kube-system kube-apiserver-k8s-master

# API server endpoints
kubectl cluster-info

# View API server configuration
kubectl -n kube-system get pod kube-apiserver-k8s-master -o yaml

# Test API server directly
curl -k https://$(kubectl config view -o jsonpath='{.clusters[0].cluster.server}') \
  --header "Authorization: Bearer $(kubectl config view -o jsonpath='{.users[0].user.token}')"
```

#### API Groups and Resources

```bash
# List all API resources
kubectl api-resources

# Example output:
# NAME          SHORTNAMES   APIVERSION         NAMESPACED   KIND
# pods          po           v1                 true         Pod
# services      svc          v1                 true         Service
# deployments   deploy       apps/v1            true         Deployment
# nodes         no           v1                 false        Node

# View API versions
kubectl api-versions

# Example output:
# admissionregistration.k8s.io/v1
# apiextensions.k8s.io/v1
# apps/v1
# authentication.k8s.io/v1
# authorization.k8s.io/v1
# batch/v1
# v1
```

---

### 2. etcd

**The cluster's database - the source of truth.**

#### What It Does

```
┌─────────────────────────────────────────────┐
│                 etcd                        │
│  Distributed Key-Value Store                │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Cluster State:                      │  │
│  │  - Node information                  │  │
│  │  - Pod specs and status              │  │
│  │  - ConfigMaps and Secrets            │  │
│  │  - Service endpoints                 │  │
│  │  - Resource quotas                   │  │
│  │  - Network policies                  │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Features:                                  │
│  - Strongly consistent                      │
│  - Distributed (HA with odd replicas)       │
│  - Watch mechanism for changes              │
└─────────────────────────────────────────────┘
```

#### Key Characteristics

- **Consistent**: Uses Raft consensus algorithm
- **Distributed**: Can run multiple replicas for HA
- **Reliable**: Handles network partitions gracefully
- **Fast**: Optimized for read-heavy workloads
- **Watchable**: Components can watch for changes

#### What's Stored in etcd

```bash
# etcd stores ALL cluster state:
- Nodes: /registry/nodes/node-name
- Pods: /registry/pods/namespace/pod-name
- Services: /registry/services/namespace/service-name
- Deployments: /registry/deployments/namespace/deployment-name
- ConfigMaps: /registry/configmaps/namespace/configmap-name
- Secrets: /registry/secrets/namespace/secret-name

# If etcd data is lost, the cluster loses all state!
```

#### Interact with etcd

```bash
# Check etcd pod
kubectl get pods -n kube-system | grep etcd
```

Expected output:
```
etcd-k8s-master   1/1   Running   0   2d
```

```bash
# View etcd logs
kubectl logs -n kube-system etcd-k8s-master

# Exec into etcd pod
kubectl exec -it -n kube-system etcd-k8s-master -- sh

# Inside etcd pod, list keys (etcd v3 API)
ETCDCTL_API=3 etcdctl \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  get / --prefix --keys-only | head -20

# Example output:
# /registry/apiregistration.k8s.io/apiservices/v1.
# /registry/configmaps/default/kube-root-ca.crt
# /registry/namespaces/default
# /registry/pods/default/nginx-xxx
```

#### etcd Backup (Critical!)

```bash
# Backup etcd data
ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd-backup.db \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key

# Verify backup
ETCDCTL_API=3 etcdctl snapshot status /tmp/etcd-backup.db --write-out=table

# Example output:
# +----------+----------+------------+------------+
# |   HASH   | REVISION | TOTAL KEYS | TOTAL SIZE |
# +----------+----------+------------+------------+
# | 12345678 |    10000 |       5000 |     5.2 MB |
# +----------+----------+------------+------------+

# Restore from backup (disaster recovery)
ETCDCTL_API=3 etcdctl snapshot restore /tmp/etcd-backup.db \
  --data-dir=/var/lib/etcd-restore
```

**Pro Tip**: Always backup etcd before major changes!

---

### 3. Scheduler (kube-scheduler)

**The matchmaker - decides which pod goes on which node.**

#### What It Does

```
┌─────────────────────────────────────────────────┐
│              Kubernetes Scheduler                │
│                                                  │
│  Watches: New pods with no node assigned        │
│                                                  │
│  Decision Process:                               │
│  ┌────────────────────────────────────────────┐ │
│  │ 1. Filtering Phase                         │ │
│  │    - Remove nodes that don't fit           │ │
│  │    - Check resource requirements           │ │
│  │    - Check node selectors                  │ │
│  │    - Check taints and tolerations          │ │
│  │                                            │ │
│  │ 2. Scoring Phase                           │ │
│  │    - Rank remaining nodes                  │ │
│  │    - Balance resource usage                │ │
│  │    - Prefer less loaded nodes              │ │
│  │    - Consider affinity rules               │ │
│  │                                            │ │
│  │ 3. Binding Phase                           │ │
│  │    - Assign pod to best scoring node       │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### Scheduling Example

```bash
# Create a pod
kubectl run nginx --image=nginx

# What scheduler does:
# 1. API server creates pod object (no node assigned)
# 2. Scheduler watches for unscheduled pods
# 3. Scheduler evaluates all nodes:

# Filtering (removes unsuitable nodes):
Node 1: ✓ Has enough CPU/memory
Node 2: ✗ Insufficient memory (removed)
Node 3: ✓ Has enough CPU/memory
Node 4: ✗ Has taint that pod doesn't tolerate (removed)

# Scoring (ranks remaining nodes):
Node 1: Score 85 (20% CPU used, 30% memory used)
Node 3: Score 92 (10% CPU used, 25% memory used) ← Winner!

# 4. Scheduler binds pod to Node 3
# 5. API server updates pod.spec.nodeName = "Node 3"
# 6. kubelet on Node 3 sees pod assignment and starts it
```

#### Check Scheduler

```bash
# Check if scheduler is running
kubectl get pods -n kube-system | grep scheduler
```

Expected output:
```
kube-scheduler-k8s-master   1/1   Running   0   2d
```

```bash
# View scheduler logs
kubectl logs -n kube-system kube-scheduler-k8s-master

# View scheduling events for a pod
kubectl describe pod nginx

# Look for "Events:" section:
# Events:
#   Type    Reason     Age   From               Message
#   ----    ------     ----  ----               -------
#   Normal  Scheduled  10s   default-scheduler  Successfully assigned default/nginx to k8s-worker1
#   Normal  Pulling    9s    kubelet            Pulling image "nginx"
#   Normal  Pulled     5s    kubelet            Successfully pulled image "nginx"
#   Normal  Created    5s    kubelet            Created container nginx
#   Normal  Started    5s    kubelet            Started container nginx
```

#### Scheduling Constraints

```yaml
# Node Selector - simple node selection
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  nodeSelector:
    disktype: ssd    # Only schedule on nodes with label disktype=ssd
  containers:
  - name: nginx
    image: nginx

---
# Node Affinity - more expressive node selection
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/hostname
            operator: In
            values:
            - k8s-worker1
            - k8s-worker2
  containers:
  - name: nginx
    image: nginx

---
# Resource Requests - scheduler ensures node has resources
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx
    resources:
      requests:
        memory: "256Mi"
        cpu: "500m"      # 0.5 CPU
      limits:
        memory: "512Mi"
        cpu: "1000m"     # 1 CPU
```

---

### 4. Controller Manager (kube-controller-manager)

**The supervisor - ensures the desired state matches actual state.**

#### What It Does

```
┌──────────────────────────────────────────────────┐
│          Kubernetes Controller Manager           │
│                                                  │
│  Runs multiple controllers (control loops):      │
│  ┌────────────────────────────────────────────┐ │
│  │ Node Controller                            │ │
│  │ - Monitors node health                     │ │
│  │ - Marks nodes NotReady after timeout       │ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │ Replication Controller                     │ │
│  │ - Maintains correct number of pods         │ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │ Endpoints Controller                       │ │
│  │ - Populates Endpoints objects              │ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │ Service Account & Token Controllers        │ │
│  │ - Creates default accounts and tokens      │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Control Loop Pattern:                           │
│  while true:                                     │
│    current_state = get_current_state()           │
│    desired_state = get_desired_state()           │
│    if current_state != desired_state:            │
│      make_changes_to_match_desired()             │
│    sleep(interval)                               │
└──────────────────────────────────────────────────┘
```

#### Built-in Controllers

```bash
# Major controllers (40+ total):

1. Node Controller
   - Monitors node health
   - Marks nodes as NotReady
   - Evicts pods from failed nodes

2. Replication Controller / ReplicaSet Controller
   - Ensures correct number of pod replicas
   - Creates/deletes pods as needed

3. Endpoints Controller
   - Updates Endpoints objects (links Services to Pods)

4. Service Account & Token Controllers
   - Creates default ServiceAccount for namespaces
   - Manages API access tokens

5. Deployment Controller
   - Manages ReplicaSets for Deployments
   - Handles rolling updates and rollbacks

6. StatefulSet Controller
   - Manages stateful applications
   - Maintains pod identity

7. DaemonSet Controller
   - Ensures pod runs on every node (or subset)

8. Job Controller
   - Runs pods to completion

9. CronJob Controller
   - Creates Jobs on schedule

10. Namespace Controller
    - Deletes resources when namespace is deleted
```

#### Controller in Action

```bash
# Example: ReplicaSet Controller

# Create deployment with 3 replicas
kubectl create deployment nginx --image=nginx --replicas=3

# Check pods
kubectl get pods
# NAME                     READY   STATUS    RESTARTS   AGE
# nginx-xxx-aaaa           1/1     Running   0          10s
# nginx-xxx-bbbb           1/1     Running   0          10s
# nginx-xxx-cccc           1/1     Running   0          10s

# Delete one pod manually
kubectl delete pod nginx-xxx-aaaa

# Controller immediately detects and creates replacement
kubectl get pods
# NAME                     READY   STATUS    RESTARTS   AGE
# nginx-xxx-bbbb           1/1     Running   0          1m
# nginx-xxx-cccc           1/1     Running   0          1m
# nginx-xxx-dddd           1/1     Running   0          3s  ← NEW POD

# Desired state: 3 replicas
# Actual state after deletion: 2 replicas
# Controller action: Create 1 new pod
```

#### Check Controller Manager

```bash
# Check if controller manager is running
kubectl get pods -n kube-system | grep controller-manager
```

Expected output:
```
kube-controller-manager-k8s-master   1/1   Running   0   2d
```

```bash
# View controller manager logs
kubectl logs -n kube-system kube-controller-manager-k8s-master

# View which controllers are running
kubectl logs -n kube-system kube-controller-manager-k8s-master | grep "Starting"

# Example output:
# Starting certificate controller
# Starting deployment controller
# Starting replicaset controller
# Starting statefulset controller
# Starting daemonset controller
```

---

### 5. Cloud Controller Manager (cloud-controller-manager)

**Interfaces with cloud provider APIs** (AWS, GCP, Azure).

#### What It Does

- **Node Controller**: Labels nodes with cloud-specific info (zone, instance type)
- **Route Controller**: Configures network routes in cloud network
- **Service Controller**: Creates cloud load balancers for LoadBalancer services
- **Volume Controller**: Creates and attaches cloud volumes

**Note**: Only present when running on cloud providers, not in bare-metal clusters.

```bash
# Example: When you create LoadBalancer service on AWS
kubectl expose deployment nginx --type=LoadBalancer --port=80

# Cloud Controller Manager:
# 1. Detects new LoadBalancer service
# 2. Calls AWS API to create ELB/ALB
# 3. Updates service with external IP
# 4. Configures ELB to forward traffic to worker nodes

kubectl get svc nginx
# NAME    TYPE           CLUSTER-IP      EXTERNAL-IP                                                              PORT(S)        AGE
# nginx   LoadBalancer   10.100.200.50   a1234567890abcdef.us-east-1.elb.amazonaws.com   80:30123/TCP   2m
```

---

## Part 2: Worker Node Components

Worker nodes are the machines that run your application containers.

### 1. kubelet

**The node agent - the most important component on worker nodes.**

#### What It Does

```
┌──────────────────────────────────────────────────┐
│                  kubelet                         │
│  "The node agent running on each worker"         │
│                                                  │
│  Responsibilities:                               │
│  ┌────────────────────────────────────────────┐ │
│  │ 1. Register node with API server           │ │
│  │ 2. Watch for pod assignments                │ │
│  │ 3. Ensure containers are running            │ │
│  │ 4. Report pod and node status               │ │
│  │ 5. Execute liveness/readiness probes        │ │
│  │ 6. Collect metrics and logs                 │ │
│  │ 7. Manage volumes                           │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Communication:                                  │
│  - Watches API server for pod assignments        │
│  - Talks to container runtime (CRI)              │
│  - Reports status back to API server             │
└──────────────────────────────────────────────────┘
```

#### kubelet Workflow

```bash
# When a pod is scheduled to a node:

1. API Server updates pod.spec.nodeName = "worker-1"
2. kubelet on worker-1 watches API server
3. kubelet sees new pod assignment
4. kubelet pulls container image (via container runtime)
5. kubelet creates containers
6. kubelet starts containers
7. kubelet monitors container health
8. kubelet reports pod status to API server

# Continuous monitoring:
while true:
  check container health
  execute liveness/readiness probes
  report status to API server
  if container crashed:
    restart container (based on restartPolicy)
  sleep(10 seconds)
```

#### Check kubelet

```bash
# kubelet runs as systemd service, not as pod
sudo systemctl status kubelet
```

Expected output:
```
● kubelet.service - kubelet: The Kubernetes Node Agent
     Loaded: loaded (/lib/systemd/system/kubelet.service)
     Active: active (running)
```

```bash
# View kubelet logs
sudo journalctl -u kubelet -f

# Check kubelet version
kubelet --version

# kubelet configuration
sudo cat /var/lib/kubelet/config.yaml

# Node information (reported by kubelet)
kubectl describe node k8s-worker1

# Look for:
# - Conditions (Ready, MemoryPressure, DiskPressure, etc.)
# - Capacity (CPU, memory, pods)
# - Allocatable resources
# - System info (OS, kernel, container runtime)
```

#### kubelet and Container Runtime Interface (CRI)

```
┌──────────────┐
│   kubelet    │
└──────┬───────┘
       │ CRI (gRPC)
       │
┌──────▼────────┐
│  containerd   │  ← Container Runtime
└──────┬────────┘
       │
┌──────▼────────┐
│     runc      │  ← Low-level container runtime
└───────────────┘
       │
┌──────▼────────┐
│  Containers   │
└───────────────┘
```

---

### 2. kube-proxy

**The network proxy - manages network rules for pod communication.**

#### What It Does

```
┌──────────────────────────────────────────────────┐
│                kube-proxy                        │
│  "Maintains network rules for pod communication" │
│                                                  │
│  Modes:                                          │
│  ┌────────────────────────────────────────────┐ │
│  │ iptables mode (default)                    │ │
│  │ - Uses iptables rules                      │ │
│  │ - Fast, but doesn't scale to 1000s of svcs│ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │ IPVS mode (better performance)             │ │
│  │ - Uses IP Virtual Server                   │ │
│  │ - Scales better, more load balancing algos│ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Responsibilities:                               │
│  - Watch Services and Endpoints                  │
│  - Update iptables/IPVS rules                    │
│  - Enable ClusterIP routing                      │
│  - Handle NodePort forwarding                    │
└──────────────────────────────────────────────────┘
```

#### How kube-proxy Works

```bash
# Example: Service with 3 backend pods

# Create service
kubectl expose deployment nginx --port=80

# Service gets ClusterIP
kubectl get svc nginx
# NAME    TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
# nginx   ClusterIP   10.96.100.100   <none>        80/TCP    1m

# kube-proxy creates iptables rules:

# 1. Traffic to 10.96.100.100:80 is intercepted
# 2. Load balanced to one of the backend pods:
#    - 10.244.1.10:80 (Pod 1 on worker-1)
#    - 10.244.2.11:80 (Pod 2 on worker-2)
#    - 10.244.1.12:80 (Pod 3 on worker-1)

# View iptables rules created by kube-proxy
sudo iptables -t nat -L KUBE-SERVICES

# You'll see rules forwarding service ClusterIP to pod IPs
```

#### Check kube-proxy

```bash
# kube-proxy runs as DaemonSet (one pod per node)
kubectl get pods -n kube-system | grep kube-proxy
```

Expected output:
```
kube-proxy-aaaa   1/1   Running   0   2d   (on node 1)
kube-proxy-bbbb   1/1   Running   0   2d   (on node 2)
kube-proxy-cccc   1/1   Running   0   2d   (on node 3)
```

```bash
# View kube-proxy logs
kubectl logs -n kube-system kube-proxy-aaaa

# Check kube-proxy mode
kubectl logs -n kube-system kube-proxy-aaaa | grep "Using"

# Example output:
# Using iptables Proxier

# View kube-proxy configuration
kubectl get configmap -n kube-system kube-proxy -o yaml
```

---

### 3. Container Runtime

**The engine that actually runs containers.**

#### Supported Runtimes

```bash
# CRI-compliant runtimes:

1. containerd (recommended)
   - Lightweight
   - Industry standard
   - Used by major cloud providers

2. CRI-O
   - Lightweight alternative
   - Specifically designed for Kubernetes

3. Docker (deprecated in K8s 1.20, removed in 1.24)
   - Still works for building images
   - Not recommended as Kubernetes runtime
```

#### Check Container Runtime

```bash
# Check which runtime is being used
kubectl get nodes -o wide

# Look at CONTAINER-RUNTIME column:
# NAME          STATUS   ROLES           CONTAINER-RUNTIME
# k8s-master    Ready    control-plane   containerd://1.7.2
# k8s-worker1   Ready    <none>          containerd://1.7.2

# Interact with containerd directly
sudo ctr --namespace k8s.io containers list

# Or use crictl (CRI debugging tool)
sudo crictl ps
```

Expected output: List of running containers
```
CONTAINER ID   IMAGE          CREATED         STATE    NAME      POD ID
abc123...      nginx:latest   5 minutes ago   Running  nginx     def456...
```

---

## How Components Communicate

### The Request Flow

Let's trace what happens when you create a deployment:

```bash
kubectl create deployment nginx --image=nginx --replicas=3
```

#### Complete Flow:

```
1. kubectl
   ├─ Reads ~/.kube/config
   ├─ Constructs HTTP POST request
   └─ Sends to API Server

2. API Server (kube-apiserver)
   ├─ Authenticates request (validates certificate)
   ├─ Authorizes request (checks RBAC)
   ├─ Validates Deployment spec
   ├─ Writes to etcd
   └─ Returns success to kubectl

3. Deployment Controller (part of controller-manager)
   ├─ Watches API Server for new Deployments
   ├─ Sees new Deployment
   ├─ Creates ReplicaSet
   └─ Writes ReplicaSet to API Server

4. ReplicaSet Controller
   ├─ Watches API Server for new ReplicaSets
   ├─ Sees new ReplicaSet (replicas: 3)
   ├─ Creates 3 Pod specs
   └─ Writes Pods to API Server (no node assigned)

5. Scheduler (kube-scheduler)
   ├─ Watches API Server for unscheduled Pods
   ├─ Sees 3 new Pods
   ├─ Evaluates nodes for each Pod
   ├─ Decides:
   │  ├─ Pod 1 → worker-1
   │  ├─ Pod 2 → worker-2
   │  └─ Pod 3 → worker-1
   └─ Updates Pod specs with node assignments

6. kubelet (on worker-1)
   ├─ Watches API Server for Pods assigned to worker-1
   ├─ Sees 2 new Pods (Pod 1 and Pod 3)
   ├─ Pulls nginx image via containerd
   ├─ Creates containers
   ├─ Starts containers
   └─ Reports status back to API Server

7. kubelet (on worker-2)
   ├─ Watches API Server for Pods assigned to worker-2
   ├─ Sees 1 new Pod (Pod 2)
   ├─ Pulls nginx image via containerd
   ├─ Creates container
   ├─ Starts container
   └─ Reports status back to API Server

8. Result
   └─ 3 nginx pods running across cluster
```

### Communication Patterns

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  Components talk to API Server (not each other)   │
│                                                    │
│         ┌────────────────────┐                    │
│         │    API Server      │                    │
│         └─────────┬──────────┘                    │
│                   │                                │
│     ┌─────────────┼─────────────┐                 │
│     │             │             │                 │
│  ┌──▼───┐   ┌────▼────┐   ┌───▼────┐             │
│  │Sched │   │  Ctrl   │   │kubelet │             │
│  │uler  │   │  Mgr    │   │        │             │
│  └──────┘   └─────────┘   └────────┘             │
│                                                    │
│  - All components watch API Server (not poll)     │
│  - Only API Server talks to etcd                  │
│  - Controllers use watch API (efficient)          │
│  - kubelet pulls work, not pushed to              │
└────────────────────────────────────────────────────┘
```

---

## Core Concepts Summary

### Cluster Hierarchy

```
Cluster (entire Kubernetes installation)
├── Namespaces (virtual clusters within cluster)
│   ├── default
│   ├── kube-system
│   ├── kube-public
│   └── kube-node-lease
│
└── Nodes (physical/virtual machines)
    ├── Master Node (Control Plane)
    │   ├── API Server
    │   ├── etcd
    │   ├── Scheduler
    │   └── Controller Manager
    │
    └── Worker Nodes
        ├── kubelet
        ├── kube-proxy
        ├── Container Runtime
        └── Pods (smallest deployable units)
            └── Containers (actual application processes)
```

### Resource Abstraction Layers

```
Higher Level Abstractions:
├── Deployment (manages ReplicaSets, rolling updates)
│   └── ReplicaSet (ensures N pod replicas)
│       └── Pod (group of containers)
│           └── Container (running process)

Networking:
├── Ingress (HTTP/HTTPS routing)
│   └── Service (stable endpoint for pods)
│       └── Endpoints (list of pod IPs)
│           └── Pod IP

Storage:
├── PersistentVolumeClaim (request for storage)
│   └── PersistentVolume (actual storage)
│       └── Volume (mounted in pod)

Configuration:
├── ConfigMap (configuration data)
└── Secret (sensitive data)
```

---

## Practical Commands

### Inspect Cluster Components

```bash
# View all control plane pods
kubectl get pods -n kube-system

# Describe API server
kubectl describe pod -n kube-system kube-apiserver-k8s-master

# View component logs
kubectl logs -n kube-system kube-scheduler-k8s-master
kubectl logs -n kube-system kube-controller-manager-k8s-master

# View node information
kubectl get nodes -o wide
kubectl describe node k8s-worker1

# Check component health
kubectl get componentstatuses  # Deprecated but still informative

# View cluster events
kubectl get events --all-namespaces --sort-by='.metadata.creationTimestamp'

# View API resources
kubectl api-resources
kubectl api-versions

# Explain resource specs
kubectl explain pod
kubectl explain pod.spec
kubectl explain pod.spec.containers
```

### Debug Component Communication

```bash
# Test API server connectivity
kubectl cluster-info
kubectl get --raw /healthz

# Check if scheduler is working
kubectl get events --field-selector involvedObject.kind=Pod,reason=Scheduled

# Check if controller manager is working
kubectl create deployment test --image=nginx --replicas=3
kubectl get replicaset  # Should see ReplicaSet created by Deployment controller

# Check kubelet on specific node
kubectl get nodes
kubectl describe node <node-name>
# Look for "Conditions" and "Allocated resources"

# Test pod scheduling
kubectl run test-pod --image=nginx
kubectl get pod test-pod -o wide  # Check which node it's on
kubectl describe pod test-pod     # Check scheduling events
```

---

## Key Takeaways

**Control Plane Components**:
- **API Server**: Front door, authentication, authorization, etcd gateway
- **etcd**: Distributed database, stores ALL cluster state
- **Scheduler**: Assigns pods to nodes based on resources and constraints
- **Controller Manager**: Runs controllers that ensure desired state
- **Cloud Controller Manager**: Interfaces with cloud provider APIs

**Worker Node Components**:
- **kubelet**: Node agent, manages pod lifecycle, reports status
- **kube-proxy**: Network proxy, manages service routing
- **Container Runtime**: Actually runs containers (containerd, CRI-O)

**Communication Pattern**:
- All components talk to API Server (hub and spoke model)
- Only API Server talks to etcd directly
- Components use watch API (efficient, real-time updates)
- kubectl → API Server → etcd → Controllers → Scheduler → kubelet → Container Runtime

**Key Principle**:
- Kubernetes is a **declarative system**
- You declare desired state (via manifests)
- Controllers continuously work to match actual state to desired state

---

## What's Next

In Part 4, we'll get hands-on with **Pods** - the fundamental unit of deployment in Kubernetes:
- Pod lifecycle and phases
- Creating pods with YAML manifests
- Multi-container pods and sidecar patterns
- Init containers
- Pod networking fundamentals
- Debugging pods with logs and exec

You now understand the architecture. Time to work with actual workloads!
