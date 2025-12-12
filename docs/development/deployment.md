# Deployment Guide

## Environments

### Development
- **URL**: http://localhost:3000
- **Database**: Local PostgreSQL
- **Services**: Docker Compose

### Staging
- **URL**: https://staging.ai-newsmaker.com
- **Database**: AWS RDS (small instance)
- **Deployment**: ArgoCD (automatic)

### Production
- **URL**: https://ai-newsmaker.com
- **Database**: AWS RDS (production)
- **Deployment**: ArgoCD (manual approval)

---

## Build

### Frontend

```bash
cd frontend
npm run build
npm run start
```

### Backend Services

```bash
# Build Docker images
docker build -t ai-newsmaker/parser-service:latest ./services/parser
docker build -t ai-newsmaker/ai-engine:latest ./services/ai-engine
docker build -t ai-newsmaker/graphql-gateway:latest ./backend/graphql-gateway
```

---

## Push to Registry

```bash
# Login to registry
docker login

# Push images
docker push ai-newsmaker/parser-service:latest
docker push ai-newsmaker/ai-engine:latest
docker push ai-newsmaker/graphql-gateway:latest
```

---

## Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress/

# Check status
kubectl get pods -n ai-newsmaker
kubectl logs -f deployment/parser-service -n ai-newsmaker
```

---

## ArgoCD Sync

```bash
# Manual sync
argocd app sync ai-newsmaker

# Check status
argocd app get ai-newsmaker
```

---

## Database Migration

```bash
# Run migrations on production
kubectl exec -it deployment/graphql-gateway -n ai-newsmaker -- npm run migrate:up
```

---

## Rollback

```bash
# Rollback deployment
kubectl rollout undo deployment/parser-service -n ai-newsmaker

# Rollback to specific revision
kubectl rollout undo deployment/parser-service --to-revision=2 -n ai-newsmaker
```

---

## Health Checks

```bash
# Check all services
kubectl get pods -n ai-newsmaker

# Check specific service
curl https://api.ai-newsmaker.com/health
```

---

**См. также:**
- [Kubernetes Configuration](../infrastructure/kubernetes.md)
- [CI/CD Pipeline](../infrastructure/cicd.md)
- [Monitoring](../infrastructure/monitoring.md)

