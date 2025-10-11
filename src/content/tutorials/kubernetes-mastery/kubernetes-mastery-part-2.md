---
title: "Kubernetes Mastery - Part 2: Installing Kubernetes on Ubuntu"
description: "Complete guide to installing Kubernetes on Ubuntu. Learn to set up both single-node clusters with Minikube and production-ready multi-node clusters with kubeadm, including all prerequisites and troubleshooting."
publishDate: 2025-10-11
publishedAt: 2025-10-11
tags: ["Kubernetes", "Installation", "Ubuntu", "Minikube", "kubeadm", "kubectl"]
difficulty: "beginner"
series: "Kubernetes Mastery"
part: 2
estimatedTime: "90 minutes"
totalParts: 10
---

# Kubernetes Mastery - Part 2: Installing Kubernetes on Ubuntu

In this tutorial, we'll install Kubernetes on Ubuntu. We'll cover two installation methods: **Minikube** for local development and learning, and **kubeadm** for production-like multi-node clusters.

## System Requirements

### Minimum Requirements (Minikube)

For single-node development cluster:
- Ubuntu 20.04 or 22.04 LTS
- 2 CPU cores (2+ recommended)
- 4GB RAM (8GB recommended)
- 20GB free disk space
- Stable internet connection
- Virtualization support (check with: `egrep -q 'vmx|svm' /proc/cpuinfo && echo yes || echo no`)

### Minimum Requirements (kubeadm Multi-Node)

For each node (master and workers):
- Ubuntu 20.04 or 22.04 LTS
- 2 CPU cores (4+ recommended for master)
- 4GB RAM minimum (8GB+ recommended)
- 30GB free disk space
- Stable internet connection
- Static IP or DHCP reservation
- Unique hostname per node
- Network connectivity between all nodes

### Pre-Installation Checklist

```bash
# Check Ubuntu version
lsb_release -a

# Check CPU cores
nproc

# Check RAM
free -h

# Check disk space
df -h

# Check if virtualization is enabled (for Minikube)
egrep -q 'vmx|svm' /proc/cpuinfo && echo "Virtualization supported" || echo "Virtualization NOT supported"

# Check swap (should be disabled for production clusters)
swapon --show
```

## Installation Path Overview

We'll cover two paths:

```
Installation Paths:
│
├─ Path 1: Minikube (Local Development)
│  - Single-node cluster
│  - Quick setup (15-20 minutes)
│  - Best for: Learning, testing, local development
│  - Components: kubectl + minikube
│
└─ Path 2: kubeadm (Production-Like)
   - Multi-node cluster (1 master + N workers)
   - More involved setup (45-60 minutes)
   - Best for: Production, staging, team environments
   - Components: kubectl + kubeadm + kubelet + container runtime
```

**Recommendation**: Start with Minikube to learn, then progress to kubeadm when ready for production scenarios.

---

## Part A: Installing Minikube (Single-Node Cluster)

Minikube creates a local Kubernetes cluster perfect for learning and development.

### Step 1: Update System

```bash
# Update package index
sudo apt update

# Upgrade existing packages
sudo apt upgrade -y

# Install required packages
sudo apt install -y curl apt-transport-https ca-certificates software-properties-common
```

**What this does**:
- Updates package repository information
- Upgrades existing packages to latest versions
- Installs utilities needed for downloading and verifying packages

### Step 2: Install Docker (Container Runtime)

```bash
# Install Docker prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify Docker installation
sudo docker --version
```

Expected output:
```
Docker version 24.0.x, build xxxxx
```

**Why Docker?**
- Minikube uses Docker as the default container runtime
- Docker also serves as the driver to run the Minikube VM

```bash
# Add current user to docker group (avoid using sudo with docker)
sudo usermod -aG docker $USER

# Apply group membership (or logout/login)
newgrp docker

# Verify docker works without sudo
docker ps
```

Expected output: Empty list (no containers running yet)

**IMPORTANT**: If you get permission errors, logout and login again for group changes to take effect.

### Step 3: Install kubectl

kubectl is the command-line tool for interacting with Kubernetes clusters.

```bash
# Download the latest stable kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Validate the binary (optional but recommended)
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.checksum"
echo "$(cat kubectl.checksum)  kubectl" | sha256sum --check
```

Expected output:
```
kubectl: OK
```

```bash
# Install kubectl
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify installation
kubectl version --client
```

Expected output:
```
Client Version: v1.28.x
```

**Alternative: Install via apt**

```bash
# Add Kubernetes apt repository
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

# Install kubectl
sudo apt update
sudo apt install -y kubectl

# Verify
kubectl version --client
```

### Step 4: Install Minikube

```bash
# Download Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Install Minikube
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Clean up downloaded file
rm minikube-linux-amd64

# Verify installation
minikube version

# Expected output:
# minikube version: v1.32.x
```

### Step 5: Start Minikube Cluster

```bash
# Start Minikube with Docker driver
minikube start --driver=docker
```

This will:
1. Download Kubernetes components (~1GB, first time only)
2. Create a Docker container running Kubernetes
3. Configure kubectl to use the Minikube cluster
4. Takes 2-5 minutes on first run

Expected output:
```
* minikube v1.32.0 on Ubuntu 22.04
* Using the docker driver based on user configuration
* Starting control plane node minikube in cluster minikube
* Pulling base image ...
* Creating docker container (CPUs=2, Memory=4000MB) ...
* Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
* Verifying Kubernetes components...
* Enabled addons: storage-provisioner, default-storageclass
* Done! kubectl is now configured to use "minikube" cluster
```

**Common Start Options**:

```bash
# Start with more resources
minikube start --driver=docker --cpus=4 --memory=8192

# Start with specific Kubernetes version
minikube start --driver=docker --kubernetes-version=v1.28.0

# Start with multiple nodes (requires Minikube 1.10.1+)
minikube start --driver=docker --nodes=3
```

### Step 6: Verify Minikube Installation

```bash
# Check cluster status
minikube status
```

Expected output:
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

```bash
# Check kubectl can connect to cluster
kubectl cluster-info
```

Expected output:
```
Kubernetes control plane is running at https://192.168.49.2:8443
CoreDNS is running at https://192.168.49.2:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

```bash
# List all nodes
kubectl get nodes
```

Expected output:
```
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   2m    v1.28.3
```

```bash
# Check all system pods are running
kubectl get pods -n kube-system
```

Expected output: Several pods in Running state
```
NAME                               READY   STATUS    RESTARTS   AGE
coredns-xxx                        1/1     Running   0          3m
etcd-minikube                      1/1     Running   0          3m
kube-apiserver-minikube            1/1     Running   0          3m
kube-controller-manager-minikube   1/1     Running   0          3m
kube-proxy-xxx                     1/1     Running   0          3m
kube-scheduler-minikube            1/1     Running   0          3m
storage-provisioner                1/1     Running   0          3m
```

### Step 7: Test Your Cluster

```bash
# Create a test deployment
kubectl create deployment hello-minikube --image=kicbase/echo-server:1.0
```

Expected output:
```
deployment.apps/hello-minikube created
```

```bash
# Expose it as a service
kubectl expose deployment hello-minikube --type=NodePort --port=8080
```

Expected output:
```
service/hello-minikube exposed
```

```bash
# Get the service URL
minikube service hello-minikube --url
```

Expected output:
```
http://192.168.49.2:xxxxx
```

```bash
# Test the service (use the URL from above)
curl $(minikube service hello-minikube --url)
```

Expected output: JSON response with request info

```bash
# Clean up test resources
kubectl delete service hello-minikube
kubectl delete deployment hello-minikube
```

### Minikube Useful Commands

```bash
# Stop the cluster (preserves state)
minikube stop

# Start existing cluster
minikube start

# Delete the cluster
minikube delete

# SSH into the Minikube VM
minikube ssh

# Open Kubernetes dashboard
minikube dashboard

# Access service in browser
minikube service <service-name>

# View logs
minikube logs

# List addons
minikube addons list

# Enable an addon (e.g., metrics-server)
minikube addons enable metrics-server

# Check IP address
minikube ip

# Pause the cluster (frees up resources)
minikube pause

# Unpause the cluster
minikube unpause
```

**Minikube Installation Complete!** You now have a working single-node Kubernetes cluster.

---

## Part B: Installing kubeadm (Multi-Node Cluster)

kubeadm creates production-like multi-node Kubernetes clusters. We'll set up a cluster with one master (control plane) and two worker nodes.

### Architecture Overview

```
┌─────────────────────┐
│   Master Node       │
│  (Control Plane)    │
│  - API Server       │
│  - Scheduler        │
│  - Controller Mgr   │
│  - etcd             │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
┌───▼────┐  ┌──▼─────┐
│ Worker │  │ Worker │
│ Node 1 │  │ Node 2 │
│        │  │        │
│ Pods   │  │ Pods   │
└────────┘  └────────┘
```

### Prerequisites for All Nodes

The following steps must be performed on **ALL nodes** (master and workers):

### Step 1: Prepare the System

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Set hostname (different on each node)
# On master:
sudo hostnamectl set-hostname k8s-master

# On worker 1:
sudo hostnamectl set-hostname k8s-worker1

# On worker 2:
sudo hostnamectl set-hostname k8s-worker2

# Verify hostname
hostname

# Update /etc/hosts with all node IPs
sudo nano /etc/hosts
```

Add these lines (replace with your actual IPs):
```
192.168.1.10  k8s-master
192.168.1.11  k8s-worker1
192.168.1.12  k8s-worker2
```

```bash
# Verify connectivity
ping -c 3 k8s-master
ping -c 3 k8s-worker1
ping -c 3 k8s-worker2
```

### Step 2: Disable Swap

Kubernetes requires swap to be disabled.

```bash
# Disable swap temporarily
sudo swapoff -a

# Disable swap permanently
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

# Verify swap is disabled
swapon --show
```

(Should show nothing)

```bash
free -h
```

Swap line should show 0B

**Why disable swap?**
- Kubernetes pods should use resource limits
- Swap can cause unpredictable performance
- Kubernetes scheduler assumes no swap

### Step 3: Load Required Kernel Modules

```bash
# Load modules immediately
sudo modprobe overlay
sudo modprobe br_netfilter

# Ensure modules load on boot
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

# Verify modules are loaded
lsmod | grep overlay
lsmod | grep br_netfilter
```

**What these modules do**:
- `overlay`: Enables OverlayFS for container storage
- `br_netfilter`: Enables bridge networking for Kubernetes

### Step 4: Configure Kernel Parameters

```bash
# Set required kernel parameters
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# Apply parameters without reboot
sudo sysctl --system

# Verify parameters
sysctl net.bridge.bridge-nf-call-iptables net.bridge.bridge-nf-call-ip6tables net.ipv4.ip_forward

# Expected output: All should be = 1
```

**What these parameters do**:
- `bridge-nf-call-iptables`: Bridge traffic passes through iptables
- `ip_forward`: Enables packet forwarding between interfaces

### Step 5: Install Container Runtime (containerd)

```bash
# Install containerd and dependencies
sudo apt update
sudo apt install -y containerd

# Create default configuration
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml

# Configure containerd to use systemd cgroup driver
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

# Restart containerd
sudo systemctl restart containerd

# Enable containerd to start on boot
sudo systemctl enable containerd

# Verify containerd is running
sudo systemctl status containerd
```

Expected output: active (running)

**Why containerd?**
- Docker was deprecated as container runtime in Kubernetes 1.20
- containerd is lightweight and CRI-compliant
- Recommended by Kubernetes project

### Step 6: Install kubeadm, kubelet, and kubectl

```bash
# Add Kubernetes apt repository
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl

# Add Kubernetes GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# Add Kubernetes repository
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

# Install Kubernetes components
sudo apt update
sudo apt install -y kubelet kubeadm kubectl

# Prevent automatic updates (important for stability)
sudo apt-mark hold kubelet kubeadm kubectl

# Verify installation
kubeadm version
kubelet --version
kubectl version --client
```

**Components explanation**:
- `kubeadm`: Tool to bootstrap the cluster
- `kubelet`: Agent that runs on each node
- `kubectl`: Command-line tool to interact with cluster

---

### Initialize Master Node (Control Plane)

**Perform these steps ONLY on the master node:**

### Step 7: Initialize Kubernetes Cluster

```bash
# Initialize the master node
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=<MASTER_IP>
```

Replace `<MASTER_IP>` with your master node's IP address

Example:
```bash
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --apiserver-advertise-address=192.168.1.10
```

This process takes 5-10 minutes and will:
1. Pull required container images
2. Generate certificates
3. Start control plane components
4. Generate bootstrap token for worker nodes

**Expected Output**:
```
[init] Using Kubernetes version: v1.28.3
[preflight] Running pre-flight checks
[preflight] Pulling images required for setting up a Kubernetes cluster
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
...
[kubelet-start] Writing kubelet environment file
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Starting the kubelet

Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.168.1.10:6443 --token abcdef.0123456789abcdef \
    --discovery-token-ca-cert-hash sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANT**: Save the `kubeadm join` command! You'll need it to add worker nodes.

### Step 8: Configure kubectl for Regular User

```bash
# Create .kube directory
mkdir -p $HOME/.kube

# Copy admin configuration
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config

# Change ownership
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Verify kubectl works
kubectl get nodes
```

Expected output:
```
NAME         STATUS     ROLES           AGE   VERSION
k8s-master   NotReady   control-plane   1m    v1.28.3
```

NotReady is expected - we need to install network plugin

### Step 9: Install Pod Network Add-on (Flannel)

```bash
# Install Flannel CNI plugin
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

# Wait for Flannel pods to start
kubectl get pods -n kube-flannel -w
```

Press Ctrl+C when all pods are Running

```bash
# Verify node is Ready
kubectl get nodes
```

Expected output:
```
NAME         STATUS   ROLES           AGE   VERSION
k8s-master   Ready    control-plane   3m    v1.28.3
```

**Network Add-on Alternatives**:
- Flannel: Simple, overlay network (what we're using)
- Calico: Advanced networking and network policies
- Weave: Easy to set up, encrypted networking
- Cilium: eBPF-based networking (advanced)

---

### Join Worker Nodes

**Perform these steps on each worker node:**

### Step 10: Join Worker Nodes to Cluster

```bash
# Use the kubeadm join command from Step 7 output
# Example (your token will be different):
sudo kubeadm join 192.168.1.10:6443 \
  --token abcdef.0123456789abcdef \
  --discovery-token-ca-cert-hash sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Expected output:
```
[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.
```

**If you lost the join command:**

```bash
# On master node, generate new token
kubeadm token create --print-join-command
```

This will output a fresh join command

### Step 11: Verify Cluster (from Master Node)

```bash
# Check all nodes
kubectl get nodes
```

Expected output (after 1-2 minutes):
```
NAME          STATUS   ROLES           AGE   VERSION
k8s-master    Ready    control-plane   10m   v1.28.3
k8s-worker1   Ready    <none>          2m    v1.28.3
k8s-worker2   Ready    <none>          1m    v1.28.3
```

```bash
# Check all system pods
kubectl get pods -n kube-system
```

All pods should be Running

```bash
# Check cluster info
kubectl cluster-info
```

Expected output:
```
Kubernetes control plane is running at https://192.168.1.10:6443
CoreDNS is running at https://192.168.1.10:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

### Step 12: Test the Cluster

```bash
# Create a test deployment
kubectl create deployment nginx --image=nginx --replicas=3

# Check deployment
kubectl get deployments

# Check pods (should be distributed across worker nodes)
kubectl get pods -o wide
```

Expected output:
```
NAME                     READY   STATUS    RESTARTS   AGE   IP           NODE
nginx-xxx-yyy            1/1     Running   0          30s   10.244.1.2   k8s-worker1
nginx-xxx-zzz            1/1     Running   0          30s   10.244.2.2   k8s-worker2
nginx-xxx-www            1/1     Running   0          30s   10.244.1.3   k8s-worker1
```

```bash
# Expose as service
kubectl expose deployment nginx --port=80 --type=NodePort

# Get service details
kubectl get svc nginx
```

Expected output:
```
NAME    TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
nginx   NodePort   10.96.100.100   <none>        80:30080/TCP   10s
```

```bash
# Test the service (from any node)
curl http://k8s-worker1:30080
```

Expected output: Nginx welcome page HTML

```bash
# Clean up
kubectl delete service nginx
kubectl delete deployment nginx
```

**kubeadm Multi-Node Installation Complete!** You now have a production-like Kubernetes cluster.

---

## Post-Installation Configuration

### Enable kubectl Autocompletion

```bash
# Add to ~/.bashrc
echo 'source <(kubectl completion bash)' >> ~/.bashrc
echo 'alias k=kubectl' >> ~/.bashrc
echo 'complete -F __start_kubectl k' >> ~/.bashrc

# Reload bashrc
source ~/.bashrc

# Test autocompletion
kubectl get <TAB>  # Should show options
k get <TAB>        # Should work with alias too
```

### Install Kubernetes Dashboard (Optional)

```bash
# Install dashboard
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# Create admin user
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF

# Get access token
kubectl -n kubernetes-dashboard create token admin-user

# Start proxy
kubectl proxy

# Access dashboard at:
# http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

# Use the token from above to login
```

### Install Helm (Package Manager)

```bash
# Download Helm installation script
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installation
helm version

# Add common repositories
helm repo add stable https://charts.helm.sh/stable
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

---

## Troubleshooting Common Issues

### Issue 1: Pods Stuck in Pending State

```bash
# Check pod events
kubectl describe pod <pod-name>

# Common causes:
# 1. Insufficient resources
kubectl get nodes
kubectl describe nodes

# 2. No worker nodes available
kubectl get nodes

# 3. Pod network not installed
kubectl get pods -n kube-system
```

### Issue 2: Node Shows NotReady

```bash
# Check node status
kubectl get nodes
kubectl describe node <node-name>

# Check kubelet logs
sudo journalctl -u kubelet -f

# Common fixes:
# 1. Restart kubelet
sudo systemctl restart kubelet

# 2. Check container runtime
sudo systemctl status containerd

# 3. Verify network plugin
kubectl get pods -n kube-system
```

### Issue 3: Cannot Connect to Cluster

```bash
# Check API server is running
kubectl cluster-info

# Verify kubeconfig
cat ~/.kube/config

# Test connectivity
curl -k https://<master-ip>:6443/version

# Check firewall (allow port 6443)
sudo ufw status
sudo ufw allow 6443/tcp
```

### Issue 4: Worker Node Won't Join

```bash
# On worker node, check kubelet
sudo journalctl -u kubelet

# Verify connectivity to master
telnet <master-ip> 6443

# Reset and rejoin
sudo kubeadm reset
sudo kubeadm join <master-ip>:6443 --token xxx --discovery-token-ca-cert-hash sha256:xxx

# Generate new token on master if expired
kubeadm token create --print-join-command
```

### Issue 5: DNS Not Working

```bash
# Check CoreDNS pods
kubectl get pods -n kube-system | grep coredns

# Test DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup kubernetes.default

# Restart CoreDNS if needed
kubectl rollout restart deployment coredns -n kube-system
```

---

## Verification Checklist

Use this checklist to verify your installation:

```bash
# [ ] All nodes show Ready
kubectl get nodes

# [ ] All system pods are Running
kubectl get pods -n kube-system

# [ ] Can create a deployment
kubectl create deployment test --image=nginx

# [ ] Can scale deployment
kubectl scale deployment test --replicas=3

# [ ] Pods are distributed across nodes
kubectl get pods -o wide

# [ ] Can expose as service
kubectl expose deployment test --port=80

# [ ] Can access service
kubectl get svc test

# [ ] Can view logs
kubectl logs deployment/test

# [ ] Can exec into pod
kubectl exec -it deployment/test -- /bin/bash

# [ ] Clean up test resources
kubectl delete service test
kubectl delete deployment test

# If all checks pass: ✅ Installation successful!
```

---

## Key Takeaways

**Minikube vs kubeadm**:
- Minikube: Single-node, quick setup, local development
- kubeadm: Multi-node, production-like, requires more configuration

**Critical Prerequisites**:
- Swap must be disabled
- Kernel modules (overlay, br_netfilter) must be loaded
- Correct sysctl parameters must be set
- Container runtime must use systemd cgroup driver

**Installation Components**:
- kubectl: CLI tool to interact with clusters
- kubeadm: Tool to bootstrap clusters
- kubelet: Agent running on each node
- Container runtime: containerd (recommended) or Docker

**Pod Network**:
- Required for pod-to-pod communication
- Must be installed after initializing control plane
- Choose based on needs: Flannel (simple), Calico (advanced), etc.

**Common Issues**:
- NotReady nodes: Usually kubelet or network plugin issues
- Pods stuck pending: Resource constraints or scheduling issues
- Connection failures: Firewall or kubeconfig problems

---

## What's Next

In Part 3, we'll dive deep into Kubernetes Architecture and Core Concepts:
- Control Plane components (API Server, Scheduler, Controller Manager, etcd)
- Worker Node components (kubelet, kube-proxy)
- How components communicate
- Understanding the Kubernetes API
- Resource hierarchy (Cluster → Namespace → Pod)

## Useful Commands Reference

```bash
# Minikube commands
minikube start                    # Start cluster
minikube stop                     # Stop cluster
minikube delete                   # Delete cluster
minikube status                   # Check status
minikube dashboard                # Open dashboard
minikube service <name>           # Access service

# kubeadm commands
sudo kubeadm init                 # Initialize master
sudo kubeadm join                 # Join worker to cluster
sudo kubeadm reset                # Reset node
kubeadm token create              # Create new token
kubeadm token list                # List tokens

# kubectl basic commands
kubectl get nodes                 # List nodes
kubectl get pods                  # List pods
kubectl get services              # List services
kubectl describe node <name>      # Node details
kubectl describe pod <name>       # Pod details
kubectl logs <pod-name>           # View logs
kubectl exec -it <pod> -- /bin/bash  # Shell into pod

# Cluster info
kubectl cluster-info              # Cluster endpoints
kubectl version                   # Version info
kubectl config view               # View kubeconfig
kubectl config get-contexts       # List contexts
kubectl config use-context <ctx>  # Switch context
```

Your Kubernetes cluster is now ready! In the next part, we'll explore how all these components work together.
