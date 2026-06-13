FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
FROM nginx:alpine AS runtime
COPY --from=builder /app/build /usr/share/nginx/html
RUN printf 'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n\n  location /api/auth {\n    proxy_pass http://auth-service.healthshop.svc.cluster.local:8081;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n  location /api/products {\n    proxy_pass http://product-service.healthshop.svc.cluster.local:8082;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n  location /api/orders {\n    proxy_pass http://order-service.healthshop.svc.cluster.local:8083;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n  location /api/cart {\n    proxy_pass http://cart-service.healthshop.svc.cluster.local:8084;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n  location /api/points {\n    proxy_pass http://point-service.healthshop.svc.cluster.local:8085;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n  location /api/reviews {\n    proxy_pass http://review-service.healthshop.svc.cluster.local:8086;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
