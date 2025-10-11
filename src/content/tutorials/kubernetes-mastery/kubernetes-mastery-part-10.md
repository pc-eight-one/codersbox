---
title: "Kubernetes Mastery Part 10: Monitoring, Logging, and Best Practices"
description: "Complete guide to Kubernetes monitoring with Prometheus/Grafana, centralized logging, security best practices, and production readiness checklist."
publishDate: 2025-10-11
publishedAt: 2025-10-11
tags: ["kubernetes", "monitoring", "logging", "prometheus", "grafana", "security", "production"]
difficulty: "advanced"
series: "Kubernetes Mastery"
part: 10
estimatedTime: "90 minutes"
totalParts: 10
---

# Part 10: Monitoring, Logging, and Best Practices

## Introduction

This final part covers essential production concerns: comprehensive monitoring with Prometheus and Grafana, centralized logging with the EFK stack, security hardening, and a complete production readiness checklist.

## Monitoring with Prometheus and Grafana

### Installing Prometheus Stack

```bash
# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack (includes Prometheus, Grafana, AlertManager)
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
  --set grafana.adminPassword=admin123

# Wait for pods to be ready
kubectl wait --for=condition=Ready pods --all -n monitoring --timeout=300s

# View all monitoring components
kubectl get all -n monitoring
```

### Accessing Prometheus and Grafana

```bash
# Port-forward Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090 &

# Port-forward Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80 &

# Access Prometheus: http://localhost:9090
# Access Grafana: http://localhost:3000 (admin/admin123)
```

### ServiceMonitor for Custom Applications

```yaml
# app-with-metrics.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sample-app
  template:
    metadata:
      labels:
        app: sample-app
    spec:
      containers:
      - name: app
        image: nginx:alpine
        ports:
        - containerPort: 80
          name: http
        - containerPort: 9113
          name: metrics
---
apiVersion: v1
kind: Service
metadata:
  name: sample-app
  namespace: default
  labels:
    app: sample-app
spec:
  selector:
    app: sample-app
  ports:
  - port: 80
    targetPort: 80
    name: http
  - port: 9113
    targetPort: 9113
    name: metrics
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sample-app-metrics
  namespace: default
  labels:
    release: prometheus  # Must match Prometheus selector
spec:
  selector:
    matchLabels:
      app: sample-app
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
```

```bash
# Apply resources
kubectl apply -f app-with-metrics.yaml

# Verify ServiceMonitor
kubectl get servicemonitor -n default

# Check if Prometheus discovered the targets
# Go to Prometheus UI -> Status -> Targets
# Should see sample-app endpoints
```

### Custom PrometheusRule

```yaml
# prometheusrule.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: app-alerts
  namespace: monitoring
  labels:
    release: prometheus
spec:
  groups:
  - name: app.rules
    interval: 30s
    rules:
    # Alert on high pod restarts
    - alert: HighPodRestartRate
      expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Pod {{ $labels.namespace }}/{{ $labels.pod }} restarting frequently"
        description: "Pod has restarted {{ $value }} times in the last 15 minutes"

    # Alert on pod crash loops
    - alert: PodCrashLooping
      expr: rate(kube_pod_container_status_restarts_total[5m]) > 0
      for: 10m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ $labels.namespace }}/{{ $labels.pod }} crash looping"

    # Alert on high CPU usage
    - alert: HighCPUUsage
      expr: sum(rate(container_cpu_usage_seconds_total[5m])) by (namespace, pod) > 0.8
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High CPU usage in {{ $labels.namespace }}/{{ $labels.pod }}"
        description: "CPU usage is {{ $value | humanizePercentage }}"

    # Alert on high memory usage
    - alert: HighMemoryUsage
      expr: sum(container_memory_working_set_bytes) by (namespace, pod) / sum(container_spec_memory_limit_bytes) by (namespace, pod) > 0.9
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High memory usage in {{ $labels.namespace }}/{{ $labels.pod }}"
        description: "Memory usage is {{ $value | humanizePercentage }}"

    # Alert on persistent volume space
    - alert: PersistentVolumeSpaceLow
      expr: (kubelet_volume_stats_used_bytes / kubelet_volume_stats_capacity_bytes) > 0.85
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "PV {{ $labels.persistentvolumeclaim }} running out of space"
        description: "Volume is {{ $value | humanizePercentage }} full"
```

```bash
# Apply PrometheusRule
kubectl apply -f prometheusrule.yaml

# Verify rules loaded
kubectl get prometheusrules -n monitoring

# Check in Prometheus UI -> Alerts
```

### Grafana Dashboards

```bash
# List pre-installed dashboards
kubectl get configmaps -n monitoring | grep grafana-dashboard

# Access Grafana and import dashboards:
# 1. Kubernetes Cluster Monitoring (ID: 7249)
# 2. Node Exporter Full (ID: 1860)
# 3. Kubernetes Pod Metrics (ID: 6417)
# 4. Kubernetes Deployment Statefulset Daemonset metrics (ID: 8588)

# Or use Grafana UI: + -> Import -> Enter Dashboard ID
```

### Custom Grafana Dashboard

```yaml
# custom-dashboard-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: custom-dashboard
  namespace: monitoring
  labels:
    grafana_dashboard: "1"
data:
  custom-dashboard.json: |
    {
      "dashboard": {
        "title": "Custom Application Dashboard",
        "panels": [
          {
            "title": "Pod CPU Usage",
            "targets": [
              {
                "expr": "sum(rate(container_cpu_usage_seconds_total{namespace=\"default\"}[5m])) by (pod)"
              }
            ],
            "type": "graph"
          }
        ]
      }
    }
```

## Centralized Logging with EFK Stack

### Installing Elasticsearch

```bash
# Add Elastic Helm repo
helm repo add elastic https://helm.elastic.co
helm repo update

# Install Elasticsearch
helm install elasticsearch elastic/elasticsearch \
  --namespace logging \
  --create-namespace \
  --set replicas=1 \
  --set minimumMasterNodes=1 \
  --set resources.requests.memory=2Gi \
  --set resources.limits.memory=2Gi \
  --set volumeClaimTemplate.resources.requests.storage=30Gi

# Wait for Elasticsearch to be ready
kubectl wait --for=condition=Ready pod -l app=elasticsearch-master -n logging --timeout=600s

# Verify Elasticsearch
kubectl port-forward -n logging svc/elasticsearch-master 9200:9200 &
curl http://localhost:9200/_cluster/health?pretty
```

### Installing Fluentd

```yaml
# fluentd-daemonset.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: fluentd
  namespace: logging
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: fluentd
rules:
- apiGroups:
  - ""
  resources:
  - pods
  - namespaces
  verbs:
  - get
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: fluentd
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: fluentd
subjects:
- kind: ServiceAccount
  name: fluentd
  namespace: logging
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: logging
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      read_from_head true
      <parse>
        @type json
        time_format %Y-%m-%dT%H:%M:%S.%NZ
      </parse>
    </source>

    <filter kubernetes.**>
      @type kubernetes_metadata
      @id filter_kube_metadata
    </filter>

    <match **>
      @type elasticsearch
      host elasticsearch-master.logging.svc.cluster.local
      port 9200
      logstash_format true
      logstash_prefix kubernetes
      <buffer>
        @type file
        path /var/log/fluentd-buffers/kubernetes.system.buffer
        flush_mode interval
        retry_type exponential_backoff
        flush_interval 5s
        retry_forever false
        retry_max_interval 30
        chunk_limit_size 2M
        queue_limit_length 8
        overflow_action block
      </buffer>
    </match>
---
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: logging
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      serviceAccountName: fluentd
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule
      containers:
      - name: fluentd
        image: fluent/fluentd-kubernetes-daemonset:v1.16-debian-elasticsearch8-1
        env:
        - name: FLUENT_ELASTICSEARCH_HOST
          value: "elasticsearch-master.logging.svc.cluster.local"
        - name: FLUENT_ELASTICSEARCH_PORT
          value: "9200"
        - name: FLUENT_ELASTICSEARCH_SCHEME
          value: "http"
        resources:
          limits:
            memory: 512Mi
            cpu: 200m
          requests:
            memory: 256Mi
            cpu: 100m
        volumeMounts:
        - name: varlog
          mountPath: /var/log
          readOnly: true
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
        - name: fluentd-config
          mountPath: /fluentd/etc/fluent.conf
          subPath: fluent.conf
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
      - name: fluentd-config
        configMap:
          name: fluentd-config
```

```bash
# Apply Fluentd DaemonSet
kubectl apply -f fluentd-daemonset.yaml

# Verify Fluentd pods
kubectl get pods -n logging -l app=fluentd
```

### Installing Kibana

```bash
# Install Kibana
helm install kibana elastic/kibana \
  --namespace logging \
  --set service.type=LoadBalancer \
  --set resources.requests.memory=1Gi \
  --set resources.limits.memory=2Gi

# Wait for Kibana to be ready
kubectl wait --for=condition=Ready pod -l app=kibana -n logging --timeout=300s

# Get Kibana URL
kubectl get svc -n logging kibana-kibana

# Port-forward Kibana
kubectl port-forward -n logging svc/kibana-kibana 5601:5601 &

# Access Kibana: http://localhost:5601
```

### Kibana Configuration

```bash
# In Kibana UI:
# 1. Go to Management -> Stack Management -> Index Patterns
# 2. Create index pattern: kubernetes-*
# 3. Select @timestamp as time field
# 4. Go to Discover to view logs

# Search examples in Kibana:
# - kubernetes.namespace_name: "default"
# - kubernetes.pod_name: "nginx-*"
# - log: "error"
# - kubernetes.labels.app: "my-app" AND level: "error"
```

## Health Checks Best Practices

### Liveness and Readiness Probes

```yaml
# health-checks.yaml
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
      - name: app
        image: nginx:alpine
        ports:
        - containerPort: 80

        # Liveness probe - restart if unhealthy
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
          successThreshold: 1

        # Readiness probe - remove from service if not ready
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
          successThreshold: 1

        # Startup probe - for slow-starting containers
        startupProbe:
          httpGet:
            path: /startup
            port: 80
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30
          successThreshold: 1

        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

### Different Probe Types

```yaml
# probe-types.yaml
apiVersion: v1
kind: Pod
metadata:
  name: probe-examples
spec:
  containers:
  - name: http-probe
    image: nginx:alpine
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
        httpHeaders:
        - name: Custom-Header
          value: Awesome
      initialDelaySeconds: 3
      periodSeconds: 3

  - name: tcp-probe
    image: redis:alpine
    livenessProbe:
      tcpSocket:
        port: 6379
      initialDelaySeconds: 15
      periodSeconds: 10

  - name: exec-probe
    image: postgres:15-alpine
    env:
    - name: POSTGRES_PASSWORD
      value: password
    livenessProbe:
      exec:
        command:
        - sh
        - -c
        - pg_isready -U postgres
      initialDelaySeconds: 30
      periodSeconds: 10
```

## Security Best Practices

### 1. Role-Based Access Control (RBAC)

```yaml
# rbac-example.yaml
---
# ServiceAccount for application
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  namespace: production
---
# Role with limited permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: production
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]
  resourceNames: ["app-config"]
---
# RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: production
subjects:
- kind: ServiceAccount
  name: app-sa
  namespace: production
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
---
# ClusterRole for cluster-wide resources
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: node-viewer
rules:
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch"]
---
# ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: view-nodes
subjects:
- kind: ServiceAccount
  name: app-sa
  namespace: production
roleRef:
  kind: ClusterRole
  name: node-viewer
  apiGroup: rbac.authorization.k8s.io
```

```bash
# Apply RBAC
kubectl apply -f rbac-example.yaml

# Test permissions
kubectl auth can-i get pods --namespace production --as system:serviceaccount:production:app-sa
kubectl auth can-i delete pods --namespace production --as system:serviceaccount:production:app-sa

# View roles and bindings
kubectl get roles,rolebindings -n production
kubectl get clusterroles,clusterrolebindings
```

### 2. Pod Security Standards

```yaml
# pod-security-standards.yaml
---
# Baseline policy (namespace label)
apiVersion: v1
kind: Namespace
metadata:
  name: baseline-ns
  labels:
    pod-security.kubernetes.io/enforce: baseline
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
---
# Restricted policy
apiVersion: v1
kind: Namespace
metadata:
  name: restricted-ns
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
---
# Secure pod example
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
  namespace: restricted-ns
spec:
  serviceAccountName: app-sa
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: nginx:alpine
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
      readOnlyRootFilesystem: true
    volumeMounts:
    - name: cache
      mountPath: /var/cache/nginx
    - name: run
      mountPath: /var/run
  volumes:
  - name: cache
    emptyDir: {}
  - name: run
    emptyDir: {}
```

```bash
# Apply pod security standards
kubectl apply -f pod-security-standards.yaml

# Try to create insecure pod (should fail in restricted namespace)
kubectl run insecure --image=nginx --namespace=restricted-ns --privileged=true
```

### 3. Network Policies for Security

```yaml
# security-network-policies.yaml
---
# Deny all ingress and egress by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
# Allow DNS
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
  namespace: production
spec:
  podSelector: {}
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
---
# Allow web traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-traffic
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
```

### 4. Secret Management

```bash
# Enable encryption at rest (on control plane)
sudo cat > /etc/kubernetes/encryption-config.yaml << EOF
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

# Update kube-apiserver to use encryption config
# Add flag: --encryption-provider-config=/etc/kubernetes/encryption-config.yaml

# Install sealed-secrets for GitOps
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Use external secret management
# Install External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets \
  external-secrets/external-secrets \
  -n external-secrets-system \
  --create-namespace
```

## Resource Management and Cost Optimization

### 1. Vertical Pod Autoscaler (VPA)

```bash
# Install VPA
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler
./hack/vpa-up.sh

cd ../../../
```

```yaml
# vpa-example.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: web-app-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  updatePolicy:
    updateMode: "Auto"  # Auto, Recreate, Initial, Off
  resourcePolicy:
    containerPolicies:
    - containerName: app
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 2
        memory: 2Gi
```

```bash
# Apply VPA
kubectl apply -f vpa-example.yaml

# View VPA recommendations
kubectl get vpa web-app-vpa -o yaml
kubectl describe vpa web-app-vpa
```

### 2. Horizontal Pod Autoscaler (HPA)

```yaml
# hpa-example.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
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
      - name: app
        image: nginx:alpine
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
```

```bash
# Install metrics-server (if not installed)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Apply HPA
kubectl apply -f hpa-example.yaml

# Watch HPA
kubectl get hpa web-app-hpa -w

# Generate load
kubectl run load-generator --image=busybox:latest --restart=Never -- /bin/sh -c "while true; do wget -q -O- http://web-app; done"

# Watch scaling
kubectl get hpa,pods -w
```

### 3. Cluster Autoscaler

```bash
# For AWS
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

# Edit the deployment with your cluster name
kubectl edit deployment cluster-autoscaler -n kube-system

# Add annotations to avoid eviction
kubectl annotate deployment cluster-autoscaler -n kube-system \
  cluster-autoscaler.kubernetes.io/safe-to-evict="false"

# View logs
kubectl logs -f deployment/cluster-autoscaler -n kube-system
```

## Backup and Disaster Recovery

### 1. Velero Installation

```bash
# Install Velero CLI on Ubuntu
wget https://github.com/vmware-tanzu/velero/releases/download/v1.12.0/velero-v1.12.0-linux-amd64.tar.gz
tar -xvf velero-v1.12.0-linux-amd64.tar.gz
sudo mv velero-v1.12.0-linux-amd64/velero /usr/local/bin/
rm -rf velero-v1.12.0-linux-amd64*

# Install Velero on cluster (AWS example)
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.8.0 \
  --bucket velero-backups \
  --backup-location-config region=us-east-1 \
  --snapshot-location-config region=us-east-1 \
  --secret-file ./credentials-velero

# Verify installation
kubectl get pods -n velero
```

### 2. Creating Backups

```bash
# Backup entire cluster
velero backup create full-backup --include-namespaces '*'

# Backup specific namespace
velero backup create prod-backup --include-namespaces production

# Backup with label selector
velero backup create app-backup --selector app=critical

# Scheduled backup
velero schedule create daily-backup --schedule="0 2 * * *" --include-namespaces production

# View backups
velero backup get
velero backup describe full-backup

# Download backup logs
velero backup logs full-backup
```

### 3. Restoring from Backups

```bash
# List available backups
velero backup get

# Restore entire backup
velero restore create --from-backup full-backup

# Restore specific namespace
velero restore create --from-backup prod-backup --include-namespaces production

# Restore to different namespace
velero restore create --from-backup prod-backup \
  --namespace-mappings production:production-restored

# View restore status
velero restore get
velero restore describe <restore-name>

# View logs
velero restore logs <restore-name>
```

## Troubleshooting Guide

### Pod Issues

```bash
# Pod stuck in Pending
kubectl describe pod <pod-name>
# Check: Insufficient resources, node selector, taints, PVC binding

# Pod stuck in CrashLoopBackOff
kubectl logs <pod-name>
kubectl logs <pod-name> --previous
kubectl describe pod <pod-name>
# Check: Application errors, misconfiguration, health probes

# Pod stuck in ImagePullBackOff
kubectl describe pod <pod-name>
# Check: Image name, image pull secrets, registry access

# Pod evicted
kubectl get events --sort-by='.lastTimestamp'
# Check: Resource pressure (memory, disk)

# Debug with ephemeral container (K8s 1.25+)
kubectl debug <pod-name> -it --image=nicolaka/netshoot
```

### Network Issues

```bash
# Test DNS
kubectl run dns-test --image=busybox:latest -it --rm --restart=Never -- nslookup kubernetes.default

# Test service connectivity
kubectl run netshoot --image=nicolaka/netshoot -it --rm --restart=Never -- /bin/bash
# Inside: curl http://service-name:port

# Check network policies
kubectl get networkpolicies -A
kubectl describe networkpolicy <policy-name>

# Verify kube-proxy
kubectl logs -n kube-system -l k8s-app=kube-proxy

# Check CoreDNS
kubectl logs -n kube-system -l k8s-app=kube-dns
```

### Storage Issues

```bash
# PVC stuck in Pending
kubectl describe pvc <pvc-name>
# Check: No matching PV, StorageClass issues

# PV not released
kubectl patch pv <pv-name> -p '{"spec":{"claimRef": null}}'

# Check storage usage
kubectl get pvc -A
kubectl describe pvc <pvc-name>
```

### Cluster Issues

```bash
# Check node status
kubectl get nodes
kubectl describe node <node-name>

# Check node conditions
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}'

# View cluster events
kubectl get events --sort-by='.lastTimestamp' -A

# Check control plane components
kubectl get componentstatuses
kubectl get pods -n kube-system

# Check API server logs
sudo journalctl -u kube-apiserver -f

# Check etcd health
kubectl exec -n kube-system etcd-<node> -- etcdctl endpoint health
```

## Production Readiness Checklist

### Security Checklist

- [ ] Enable RBAC and principle of least privilege
- [ ] Implement Pod Security Standards (restricted)
- [ ] Enable encryption at rest for secrets
- [ ] Use network policies to restrict traffic
- [ ] Scan images for vulnerabilities
- [ ] Use private container registries
- [ ] Implement admission controllers (OPA/Gatekeeper)
- [ ] Enable audit logging
- [ ] Rotate credentials regularly
- [ ] Use service accounts, not default

### High Availability Checklist

- [ ] Multi-node control plane (3+ nodes)
- [ ] Multi-zone/region deployment
- [ ] Configure Pod Disruption Budgets
- [ ] Use multiple replicas for critical services
- [ ] Implement health checks (liveness, readiness)
- [ ] Configure resource requests and limits
- [ ] Set up monitoring and alerting
- [ ] Implement autoscaling (HPA, VPA, CA)
- [ ] Use anti-affinity for replica distribution

### Monitoring and Logging Checklist

- [ ] Deploy Prometheus for metrics
- [ ] Set up Grafana dashboards
- [ ] Configure alerting rules
- [ ] Implement centralized logging (EFK/Loki)
- [ ] Monitor node and cluster health
- [ ] Track resource utilization
- [ ] Set up SLIs and SLOs
- [ ] Configure log retention policies

### Backup and DR Checklist

- [ ] Implement regular backups (Velero)
- [ ] Test restore procedures
- [ ] Backup persistent volumes
- [ ] Document disaster recovery plan
- [ ] Set up cross-region replication
- [ ] Maintain configuration in version control
- [ ] Regular disaster recovery drills

### Operations Checklist

- [ ] Use GitOps for deployments (ArgoCD/Flux)
- [ ] Implement CI/CD pipelines
- [ ] Use Helm for package management
- [ ] Maintain documentation
- [ ] Set up development/staging/production environments
- [ ] Implement rollback strategies
- [ ] Use namespaces for isolation
- [ ] Tag and version all resources

### Performance Checklist

- [ ] Right-size resource requests/limits
- [ ] Enable cluster autoscaling
- [ ] Use horizontal pod autoscaling
- [ ] Optimize container images (multi-stage builds)
- [ ] Implement caching strategies
- [ ] Use CDN for static assets
- [ ] Configure persistent volume performance
- [ ] Monitor and optimize database queries

## Summary

Congratulations! You've completed the Kubernetes Mastery series. In this final part, you learned:

- Installing and configuring Prometheus and Grafana for monitoring
- Creating custom alerts and dashboards
- Setting up centralized logging with EFK stack
- Implementing health checks effectively
- Security best practices (RBAC, Pod Security, Network Policies)
- Resource management and cost optimization
- Backup and disaster recovery with Velero
- Comprehensive troubleshooting techniques
- Production readiness checklist

### Key Commands Reference

```bash
# Monitoring
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Logging
kubectl logs <pod-name>
kubectl logs <pod-name> -c <container-name>
kubectl logs -f <pod-name>
kubectl logs --tail=100 <pod-name>

# Debugging
kubectl describe pod <pod-name>
kubectl get events --sort-by='.lastTimestamp'
kubectl debug <pod-name> -it --image=nicolaka/netshoot

# Backups
velero backup create <name>
velero restore create --from-backup <name>
velero schedule create <name> --schedule="0 2 * * *"

# Monitoring resources
kubectl top nodes
kubectl top pods
kubectl get hpa
```

### Next Steps

- Explore service meshes (Istio, Linkerd)
- Learn Kubernetes operators
- Implement GitOps with ArgoCD or Flux
- Study Kubernetes internals and controllers
- Contribute to Kubernetes ecosystem
- Get certified (CKA, CKAD, CKS)

Thank you for completing this comprehensive Kubernetes journey! Keep practicing, and remember: production-ready Kubernetes is a continuous learning process.
