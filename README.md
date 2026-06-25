# Pointer Lab — Frontend

Angular 21 single-page app (standalone components, signals). Filterable problem list plus a problem detail page with a pointer-trace visualizer and JavaScript code editor.

---

## Prerequisites

| Tool    | Version     | Check             |
|---------|-------------|-------------------|
| Node.js | 20 or newer | `node --version`  |
| npm     | 10 or newer | `npm --version`   |
| Docker  | any         | `docker --version`|

---

## Local development

The dev server proxies `/api` to `http://localhost:8080` (see `proxy.conf.json`), so start the backend first.

```bash
npm install
npm start
```

Open **http://localhost:4200**.

---

## Build Docker image

```bash
docker build -t pointer-lab-frontend:latest .
```

---

## Deploy to Kubernetes

Apply the backend manifests first (namespace + backend service must exist for the Ingress to route correctly), then:

```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

The Ingress routes `/api/` → `pointer-lab-backend:8080` and `/` → `pointer-lab-frontend:80`.

For local clusters (minikube / kind), enable the ingress addon:

```bash
# minikube
minikube addons enable ingress

# kind — install ingress-nginx manually
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/kind/deploy.yaml
```

---

## Project layout

```
pointer-lab-frontend/
├── Dockerfile
├── nginx.conf
├── angular.json
├── package.json
├── proxy.conf.json          # dev-server proxy only (not used in k8s)
├── k8s/
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   └── ingress.yaml
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.css
    └── app/
        ├── app.ts
        ├── app.routes.ts
        ├── core/            # models + API service
        └── features/
            ├── problem-list/
            └── problem-detail/
```