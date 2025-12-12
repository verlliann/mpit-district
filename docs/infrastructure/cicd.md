# CI/CD Pipeline

## GitHub Actions

### Build and Test

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test
      
      - name: Build
        run: npm run build

  build-docker:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t ai-newsmaker/frontend:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push ai-newsmaker/frontend:${{ github.sha }}
```

---

## ArgoCD (GitOps)

### Application

```yaml
# argocd/application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-newsmaker
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/ai-newsmaker
    targetRevision: HEAD
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: ai-newsmaker
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

---

## Deployment Workflow

1. **Push to `develop`** → Deploy to Staging
2. **PR to `main`** → Review & Test
3. **Merge to `main`** → Deploy to Production (with approval)

---

**См. также:**
- [Kubernetes](./kubernetes.md)
- [Monitoring](./monitoring.md)

