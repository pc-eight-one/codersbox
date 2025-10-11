---
title: "Kubernetes Mastery Part 8: Persistent Storage"
description: "Master Kubernetes storage with volumes, PersistentVolumes, PersistentVolumeClaims, StorageClasses, and StatefulSets for stateful applications."
publishDate: 2025-10-11
publishedAt: 2025-10-11
tags: ["kubernetes", "storage", "volumes", "persistentvolumes", "statefulsets", "databases"]
difficulty: "intermediate"
series: "Kubernetes Mastery"
part: 8
estimatedTime: "80 minutes"
totalParts: 10
---

# Part 8: Persistent Storage

## Introduction

Containers are ephemeral by design, but many applications require persistent data storage. Kubernetes provides a sophisticated storage system with Volumes, PersistentVolumes (PV), PersistentVolumeClaims (PVC), and StorageClasses to manage stateful workloads.

## Understanding Kubernetes Storage

### Storage Lifecycle

1. **Volume** - Storage directly defined in pod spec (lifecycle tied to pod)
2. **PersistentVolume (PV)** - Cluster-level storage resource (lifecycle independent of pods)
3. **PersistentVolumeClaim (PVC)** - Request for storage by a user
4. **StorageClass** - Dynamic provisioning of PVs

## Volumes

Volumes are directories accessible to containers in a pod.

### 1. emptyDir

Empty directory created when pod is assigned to a node, deleted when pod is removed.

```yaml
# emptydir-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: emptydir-pod
spec:
  containers:
  - name: writer
    image: busybox:latest
    command: ["sh", "-c", "while true; do echo $(date) >> /data/log.txt; sleep 5; done"]
    volumeMounts:
    - name: shared-data
      mountPath: /data
  - name: reader
    image: busybox:latest
    command: ["sh", "-c", "while true; do cat /data/log.txt; sleep 10; done"]
    volumeMounts:
    - name: shared-data
      mountPath: /data
  volumes:
  - name: shared-data
    emptyDir: {}
```

```bash
# Apply the pod
kubectl apply -f emptydir-pod.yaml

# Check writer logs
kubectl logs emptydir-pod -c writer

# Check reader logs
kubectl logs emptydir-pod -c reader

# Delete pod - data is lost
kubectl delete pod emptydir-pod
```

**emptyDir with memory backing:**

```yaml
# emptydir-memory.yaml
apiVersion: v1
kind: Pod
metadata:
  name: emptydir-memory
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: cache
      mountPath: /cache
  volumes:
  - name: cache
    emptyDir:
      medium: Memory
      sizeLimit: 128Mi
```

### 2. hostPath

Mounts a file or directory from the host node's filesystem.

```yaml
# hostpath-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: hostpath-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: host-data
      mountPath: /data
  volumes:
  - name: host-data
    hostPath:
      path: /mnt/data
      type: DirectoryOrCreate
```

```bash
# Apply the pod
kubectl apply -f hostpath-pod.yaml

# Get node where pod is running
NODE=$(kubectl get pod hostpath-pod -o jsonpath='{.spec.nodeName}')
echo "Pod is running on: $NODE"

# Write data from pod
kubectl exec hostpath-pod -- sh -c "echo 'Hello from pod' > /data/test.txt"

# SSH to node and verify (if you have access)
# ssh $NODE
# cat /mnt/data/test.txt
```

**Warning:** hostPath is not recommended for production. Data is node-specific and not portable.

### 3. ConfigMap Volume

```yaml
# configmap-volume.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  config.json: |
    {
      "database": "postgres",
      "port": 5432
    }
  settings.ini: |
    [app]
    debug=false
---
apiVersion: v1
kind: Pod
metadata:
  name: configmap-volume-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: config
      mountPath: /etc/config
      readOnly: true
  volumes:
  - name: config
    configMap:
      name: app-config
```

```bash
# Apply and test
kubectl apply -f configmap-volume.yaml
kubectl exec configmap-volume-pod -- ls /etc/config
kubectl exec configmap-volume-pod -- cat /etc/config/config.json
```

### 4. Secret Volume

```yaml
# secret-volume.yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData:
  username: admin
  password: secretpass123
---
apiVersion: v1
kind: Pod
metadata:
  name: secret-volume-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: secrets
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secrets
    secret:
      secretName: db-secret
      defaultMode: 0400
```

```bash
# Apply and test
kubectl apply -f secret-volume.yaml
kubectl exec secret-volume-pod -- ls -la /etc/secrets
kubectl exec secret-volume-pod -- cat /etc/secrets/username
```

## PersistentVolumes (PV) and PersistentVolumeClaims (PVC)

PersistentVolumes are cluster resources that exist independent of pods.

### Static Provisioning

#### 1. Create PersistentVolume

```yaml
# pv-local.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: local-pv-1
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: local-storage
  local:
    path: /mnt/data
  nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/hostname
          operator: In
          values:
          - node-1  # Replace with your node name
```

```bash
# Create directory on node
# ssh node-1
# sudo mkdir -p /mnt/data
# sudo chmod 777 /mnt/data

# Apply PV
kubectl apply -f pv-local.yaml

# View PV
kubectl get pv
kubectl describe pv local-pv-1
```

#### 2. Create PersistentVolumeClaim

```yaml
# pvc-local.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: local-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: local-storage
```

```bash
# Apply PVC
kubectl apply -f pvc-local.yaml

# View PVC
kubectl get pvc
kubectl describe pvc local-pvc

# Check binding status
kubectl get pv,pvc
```

#### 3. Use PVC in Pod

```yaml
# pod-with-pvc.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-storage
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: data
      mountPath: /usr/share/nginx/html
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: local-pvc
```

```bash
# Apply the pod
kubectl apply -f pod-with-pvc.yaml

# Write data to volume
kubectl exec app-with-storage -- sh -c "echo '<h1>Persistent Data</h1>' > /usr/share/nginx/html/index.html"

# Delete and recreate pod
kubectl delete pod app-with-storage
kubectl apply -f pod-with-pvc.yaml

# Verify data persists
kubectl exec app-with-storage -- cat /usr/share/nginx/html/index.html
```

### Access Modes

- **ReadWriteOnce (RWO)** - Volume can be mounted read-write by a single node
- **ReadOnlyMany (ROX)** - Volume can be mounted read-only by many nodes
- **ReadWriteMany (RWX)** - Volume can be mounted read-write by many nodes
- **ReadWriteOncePod (RWOP)** - Volume can be mounted read-write by a single pod (K8s 1.22+)

### Reclaim Policies

- **Retain** - Manual reclamation (PV kept after PVC deletion)
- **Delete** - PV and underlying storage deleted with PVC
- **Recycle** - Basic scrub (`rm -rf /volume/*`) - deprecated

```yaml
# pv-with-policies.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-retain
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain  # Data kept after claim deletion
  storageClassName: standard
  hostPath:
    path: /mnt/pv-retain
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-delete
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete  # Data deleted with claim
  storageClassName: standard
  hostPath:
    path: /mnt/pv-delete
```

## StorageClasses and Dynamic Provisioning

StorageClasses enable dynamic PV creation.

### 1. Create StorageClass

```yaml
# storageclass-local.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-storage
provisioner: kubernetes.io/no-provisioner  # For local volumes
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

```bash
# Apply StorageClass
kubectl apply -f storageclass-local.yaml

# View StorageClasses
kubectl get storageclass
kubectl describe storageclass fast-storage
```

### 2. Dynamic Provisioning Example (AWS EBS)

```yaml
# storageclass-aws.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: aws-ebs-gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
  encrypted: "true"
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
reclaimPolicy: Delete
```

```yaml
# pvc-dynamic.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: aws-ebs-gp3
  resources:
    requests:
      storage: 20Gi
```

```bash
# Apply PVC - PV will be created automatically
kubectl apply -f pvc-dynamic.yaml

# Watch PV creation
kubectl get pvc dynamic-pvc -w

# View created PV
kubectl get pv
```

### 3. Volume Expansion

```bash
# Check if StorageClass allows expansion
kubectl get storageclass aws-ebs-gp3 -o jsonpath='{.allowVolumeExpansion}'

# Expand PVC
kubectl patch pvc dynamic-pvc -p '{"spec":{"resources":{"requests":{"storage":"30Gi"}}}}'

# Watch expansion
kubectl get pvc dynamic-pvc -w

# Verify new size
kubectl describe pvc dynamic-pvc
```

## StatefulSets

StatefulSets manage stateful applications with stable network identities and persistent storage.

### StatefulSet Features

- Stable, unique network identifiers
- Stable, persistent storage
- Ordered, graceful deployment and scaling
- Ordered, automated rolling updates

### 1. Basic StatefulSet

```yaml
# statefulset-basic.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-headless
spec:
  clusterIP: None
  selector:
    app: nginx-sts
  ports:
  - port: 80
    name: web
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: nginx-sts
spec:
  serviceName: nginx-headless
  replicas: 3
  selector:
    matchLabels:
      app: nginx-sts
  template:
    metadata:
      labels:
        app: nginx-sts
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
          name: web
        volumeMounts:
        - name: data
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: standard
      resources:
        requests:
          storage: 1Gi
```

```bash
# Apply StatefulSet
kubectl apply -f statefulset-basic.yaml

# Watch pods being created (ordered)
kubectl get pods -l app=nginx-sts -w

# View created PVCs
kubectl get pvc

# Check pod DNS names
kubectl run dns-test --image=busybox:latest -it --rm --restart=Never -- nslookup nginx-sts-0.nginx-headless

# Write unique data to each pod
for i in 0 1 2; do
  kubectl exec nginx-sts-$i -- sh -c "echo 'Pod nginx-sts-$i' > /usr/share/nginx/html/index.html"
done

# Verify unique data
for i in 0 1 2; do
  echo "Data from nginx-sts-$i:"
  kubectl exec nginx-sts-$i -- cat /usr/share/nginx/html/index.html
done

# Delete and verify persistence
kubectl delete pod nginx-sts-1

# Wait for pod to recreate
kubectl wait --for=condition=Ready pod/nginx-sts-1 --timeout=60s

# Verify data persists
kubectl exec nginx-sts-1 -- cat /usr/share/nginx/html/index.html
```

### 2. Scaling StatefulSet

```bash
# Scale up
kubectl scale statefulset nginx-sts --replicas=5

# Watch pods being created (ordered: 3, then 4)
kubectl get pods -l app=nginx-sts -w

# Scale down
kubectl scale statefulset nginx-sts --replicas=2

# Watch pods being deleted (reverse order: 4, then 3)
kubectl get pods -l app=nginx-sts -w

# Note: PVCs are NOT deleted automatically
kubectl get pvc
```

### 3. Update Strategy

```yaml
# statefulset-update.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: nginx-sts
spec:
  serviceName: nginx-headless
  replicas: 3
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      partition: 0  # Update all pods
  selector:
    matchLabels:
      app: nginx-sts
  template:
    metadata:
      labels:
        app: nginx-sts
    spec:
      containers:
      - name: nginx
        image: nginx:1.25-alpine  # Updated version
        ports:
        - containerPort: 80
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: standard
      resources:
        requests:
          storage: 1Gi
```

```bash
# Apply update
kubectl apply -f statefulset-update.yaml

# Watch rolling update (reverse order: 2, 1, 0)
kubectl rollout status statefulset nginx-sts

# Check image versions
kubectl get pods -l app=nginx-sts -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}{end}'
```

### 4. Practical Example: PostgreSQL StatefulSet

```yaml
# postgres-statefulset.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-config
data:
  POSTGRES_DB: "myapp"
  POSTGRES_USER: "myuser"
---
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
stringData:
  POSTGRES_PASSWORD: "mysecretpassword"
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
  - port: 5432
    name: postgres
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector:
    app: postgres
  type: ClusterIP
  ports:
  - port: 5432
    targetPort: 5432
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres-headless
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
          name: postgres
        envFrom:
        - configMapRef:
            name: postgres-config
        - secretRef:
            name: postgres-secret
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
          subPath: postgres
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U myuser -d myapp
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U myuser -d myapp
          initialDelaySeconds: 5
          periodSeconds: 5
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: standard
      resources:
        requests:
          storage: 10Gi
```

```bash
# Apply PostgreSQL StatefulSet
kubectl apply -f postgres-statefulset.yaml

# Wait for pod to be ready
kubectl wait --for=condition=Ready pod/postgres-0 --timeout=120s

# Connect to database
kubectl exec -it postgres-0 -- psql -U myuser -d myapp

# In psql:
# CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100));
# INSERT INTO users (name) VALUES ('Alice'), ('Bob'), ('Charlie');
# SELECT * FROM users;
# \q

# Test data persistence
kubectl delete pod postgres-0
kubectl wait --for=condition=Ready pod/postgres-0 --timeout=120s

# Verify data persists
kubectl exec -it postgres-0 -- psql -U myuser -d myapp -c "SELECT * FROM users;"
```

## Volume Snapshots

VolumeSnapshots allow you to take snapshots of PVs.

### 1. Install Snapshot CRDs and Controller

```bash
# Install VolumeSnapshot CRDs
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshotclasses.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshotcontents.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshots.yaml

# Install snapshot controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/deploy/kubernetes/snapshot-controller/setup-snapshot-controller.yaml
```

### 2. Create VolumeSnapshotClass

```yaml
# volumesnapshotclass.yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: csi-snapshot-class
driver: ebs.csi.aws.com  # Use your CSI driver
deletionPolicy: Delete
```

### 3. Create Snapshot

```yaml
# volumesnapshot.yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: postgres-snapshot
spec:
  volumeSnapshotClassName: csi-snapshot-class
  source:
    persistentVolumeClaimName: postgres-data-postgres-0
```

```bash
# Create snapshot
kubectl apply -f volumesnapshot.yaml

# Check snapshot status
kubectl get volumesnapshot
kubectl describe volumesnapshot postgres-snapshot
```

### 4. Restore from Snapshot

```yaml
# pvc-from-snapshot.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-restored
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: aws-ebs-gp3
  resources:
    requests:
      storage: 10Gi
  dataSource:
    name: postgres-snapshot
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
```

## Volume Cloning

Clone an existing PVC to a new PVC.

```yaml
# pvc-clone.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-clone
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 10Gi
  dataSource:
    name: postgres-data-postgres-0
    kind: PersistentVolumeClaim
```

```bash
# Create clone
kubectl apply -f pvc-clone.yaml

# Wait for clone
kubectl get pvc postgres-clone -w

# Use cloned volume
```

## Storage Best Practices

### 1. Resource Management

```yaml
# Use resource requests and limits
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-storage
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
    limits:
      storage: 20Gi  # Maximum size if expansion enabled
  storageClassName: fast-storage
```

### 2. Backup Strategy

```bash
# Create backup script
cat > backup-postgres.sh << 'EOF'
#!/bin/bash
BACKUP_NAME="postgres-backup-$(date +%Y%m%d-%H%M%S)"

# Create snapshot
cat <<YAML | kubectl apply -f -
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: $BACKUP_NAME
spec:
  volumeSnapshotClassName: csi-snapshot-class
  source:
    persistentVolumeClaimName: postgres-data-postgres-0
YAML

echo "Backup created: $BACKUP_NAME"
EOF

chmod +x backup-postgres.sh
./backup-postgres.sh
```

### 3. Monitoring Storage

```bash
# Check PVC usage
kubectl get pvc -A

# Describe PVC for details
kubectl describe pvc <pvc-name>

# Check storage capacity
kubectl get pv -o custom-columns=NAME:.metadata.name,CAPACITY:.spec.capacity.storage,STATUS:.status.phase

# Find unused PVCs
kubectl get pvc -A -o json | jq -r '.items[] | select(.status.phase=="Bound") | select(.spec.volumeName as $pv | .metadata.namespace as $ns | ([.items[].spec.volumes[]? | select(.persistentVolumeClaim.claimName)] | length) == 0) | "\(.metadata.namespace)/\(.metadata.name)"'
```

## Troubleshooting Storage Issues

```bash
# PVC stuck in Pending
kubectl describe pvc <pvc-name>
# Check: No matching PV, StorageClass issues, insufficient resources

# View storage events
kubectl get events --sort-by='.lastTimestamp' | grep -i "persistentvolume"

# Check PV status
kubectl get pv
kubectl describe pv <pv-name>

# Verify StorageClass
kubectl get storageclass
kubectl describe storageclass <sc-name>

# Check CSI driver (if applicable)
kubectl get pods -n kube-system | grep csi

# Manually clean up PVs in Released state
kubectl patch pv <pv-name> -p '{"spec":{"claimRef": null}}'

# Force delete stuck PVC
kubectl patch pvc <pvc-name> -p '{"metadata":{"finalizers":null}}'
kubectl delete pvc <pvc-name> --force --grace-period=0
```

## Summary

In this part, you learned:

- Different volume types (emptyDir, hostPath, configMap, secret)
- PersistentVolumes and PersistentVolumeClaims
- StorageClasses and dynamic provisioning
- Access modes and reclaim policies
- StatefulSets for stateful applications
- Volume snapshots and cloning
- PostgreSQL deployment with persistent storage
- Storage monitoring and troubleshooting

**Key Commands:**

```bash
# PV/PVC operations
kubectl get pv
kubectl get pvc
kubectl describe pv <name>
kubectl describe pvc <name>

# StorageClass
kubectl get storageclass
kubectl describe storageclass <name>

# StatefulSet operations
kubectl get statefulset
kubectl scale statefulset <name> --replicas=<n>
kubectl rollout status statefulset <name>

# Volume snapshots
kubectl get volumesnapshot
kubectl describe volumesnapshot <name>
```

In Part 9, we'll explore advanced topics including Ingress, Jobs, CronJobs, DaemonSets, and resource management.
