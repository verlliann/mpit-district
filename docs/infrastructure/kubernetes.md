# Kubernetes Configuration

## Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ai-newsmaker
```

---

## Deployments

### Parser Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: parser-service
  namespace: ai-newsmaker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: parser-service
  template:
    metadata:
      labels:
        app: parser-service
    spec:
      containers:
      - name: parser
        image: ai-newsmaker/parser-service:latest
        ports:
        - containerPort: 50051
        env:
        - name: REDIS_URL
          value: "redis://redis:6379"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          grpc:
            port: 50051
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          grpc:
            port: 50051
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: parser-service
  namespace: ai-newsmaker
spec:
  selector:
    app: parser-service
  ports:
  - port: 50051
    targetPort: 50051
  type: ClusterIP
```

---

## ConfigMaps

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: ai-newsmaker
data:
  ENVIRONMENT: "production"
  LOG_LEVEL: "info"
  REDIS_URL: "redis://redis:6379"
  DATABASE_URL: "postgresql://user:pass@postgres:5432/aidb"
```

---

## Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: llm-secrets
  namespace: ai-newsmaker
type: Opaque
stringData:
  anthropic-key: "sk-ant-..."
  openai-key: "sk-..."
```

---

## Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ai-newsmaker-ingress
  namespace: ai-newsmaker
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.ai-newsmaker.com
    secretName: api-tls
  rules:
  - host: api.ai-newsmaker.com
    http:
      paths:
      - path: /graphql
        pathType: Prefix
        backend:
          service:
            name: graphql-gateway
            port:
              number: 4000
```

---

## HPA (Horizontal Pod Autoscaler)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: parser-hpa
  namespace: ai-newsmaker
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: parser-service
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
```

---

## StatefulSet (PostgreSQL)

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: ai-newsmaker
spec:
  serviceName: postgres
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
        env:
        - name: POSTGRES_DB
          value: aidb
        - name: POSTGRES_USER
          value: aiuser
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
```

---

**См. также:**
- [CI/CD](./cicd.md)
- [Monitoring](./monitoring.md)

