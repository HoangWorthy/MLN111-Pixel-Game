# CD Pipeline Deployment Guide

Huong dan nay dung cho pipeline hien tai: GitHub Actions build Docker image, push len Docker Hub, SSH vao VPS, sau do chay `docker compose pull` va `docker compose up -d`.

## 1. Overview

Pipeline trong `.github/workflows/deploy.yaml` co 2 job:

1. `build-and-push-image`: checkout code, login Docker Hub, build Docker image tu `Dockerfile`, push image len Docker Hub.
2. `deploy`: SSH vao VPS `115.73.218.193`, vao thu muc deploy, pull image moi nhat va restart container bang Docker Compose.

Ung dung gom 2 process trong cung container:

- Next.js client chay tren `CLIENT_PORT`, mac dinh `25577`.
- Express + Socket.IO multiplayer server chay tren `PORT`, mac dinh `25578`.

De multiplayer hoat dong, frontend phai tro dung ve public URL cua Socket.IO server qua `NEXT_PUBLIC_SERVER_URL`.

## 2. Required naming convention

Chuan deploy cua project nay la `mln111`.

Hien tai repo dang bi lech ten:

- `.github/workflows/deploy.yaml` dang push image `huyhoang204205/vnr202:latest` va pull service `vnr202`.
- `docker-compose.yml` dang dung service/image/container `mln131`.

Truoc khi chay pipeline, can sua dong bo tat ca ve `mln111`.

Trong `.github/workflows/deploy.yaml`, image tag nen la:

```yaml
tags: huyhoang204205/mln111:latest
cache-from: type=registry,ref=huyhoang204205/mln111:latest
```

Lenh deploy nen pull dung service:

```bash
docker compose pull mln111
docker compose up -d
```

Neu doi thu muc deploy theo ten moi, dong `cd` nen la:

```bash
cd /home/huyhoang204205/Documents/mln111
```

Neu van giu thu muc cu `/home/huyhoang204205/Documents/vnr202`, workflow va VPS phai cung dung dung thu muc do.

Trong `docker-compose.yml`, service nen la:

```yaml
services:
  mln111:
    image: huyhoang204205/mln111:latest
    container_name: mln111
    restart: always
    ports:
      - "25577:25577"
      - "25578:25578"
    environment:
      - NODE_ENV=production
      - PORT=${PORT:-25578}
      - CLIENT_PORT=${CLIENT_PORT:-25577}
      - CLIENT_URL=${CLIENT_URL}
      - NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
```

## 3. GitHub Secrets

Vao GitHub repository, mo `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`.

Can tao cac secret sau:

| Secret | Gia tri |
| --- | --- |
| `DOCKERHUB_USERNAME` | Docker Hub username, vi du `huyhoang204205` |
| `DOCKERHUB_PASSWORD` | Docker Hub password hoac access token |
| `SSH_PRIVATE_KEY` | Private key dung de SSH vao VPS user `huyhoang204205` |
| `SSH_PASS` | Password sudo tren VPS, dang duoc workflow dung cho `sudo -S` |

Public key tu `SSH_PRIVATE_KEY` phai co trong file nay tren VPS:

```bash
/home/huyhoang204205/.ssh/authorized_keys
```

## 4. Docker Hub setup

Tao Docker Hub repository:

```text
huyhoang204205/mln111
```

Neu repository la private, VPS can login Docker Hub truoc khi pull:

```bash
docker login
```

Neu repository la public, VPS co the pull truc tiep ma khong can login.

## 5. VPS setup

SSH vao VPS:

```bash
ssh huyhoang204205@115.73.218.193
```

Cai Docker va Docker Compose plugin neu chua co:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

Tao thu muc deploy khop voi dong `cd` trong workflow:

```bash
mkdir -p /home/huyhoang204205/Documents/mln111
cd /home/huyhoang204205/Documents/mln111
```

Dat `docker-compose.yml` vao thu muc nay. File compose tren VPS phai dung service `mln111` va image `huyhoang204205/mln111:latest`.

Copy env template tu repo thanh file `.env` trong thu muc deploy:

```bash
cp deployment.env.example .env
```

Sau do sua `.env` theo public URL cua deployment:

```env
PORT=25578
CLIENT_PORT=25577
CLIENT_URL=https://your-client-domain.example.com
NEXT_PUBLIC_SERVER_URL=https://your-socket-server-domain.example.com
```

Neu chua co domain, co the dung IP va port:

```env
CLIENT_URL=http://115.73.218.193:25577
NEXT_PUBLIC_SERVER_URL=http://115.73.218.193:25578
```

Mo firewall cho 2 port:

```bash
sudo ufw allow 25577/tcp
sudo ufw allow 25578/tcp
```

## 6. Build arguments for multiplayer

`NEXT_PUBLIC_SERVER_URL` la bien public cua Next.js, nen no can co gia tri dung trong luc build image.

Trong step `Build and push` cua `.github/workflows/deploy.yaml`, nen them `build-args`:

```yaml
- name: Build and push
  uses: docker/build-push-action@v6
  with:
    context: .
    push: true
    tags: huyhoang204205/mln111:latest
    cache-from: type=registry,ref=huyhoang204205/mln111:latest
    cache-to: type=inline
    build-args: |
      NEXT_PUBLIC_SERVER_URL=https://your-socket-server-domain.example.com
      CLIENT_URL=https://your-client-domain.example.com
      PORT=25578
      CLIENT_PORT=25577
```

Gia tri `NEXT_PUBLIC_SERVER_URL` trong build args va trong `.env` tren VPS nen giong nhau de Socket.IO client ket noi dung server.

## 7. Workflow checklist

Truoc khi chay CD:

- Docker Hub da co repo `huyhoang204205/mln111`.
- GitHub Actions da co du 4 secret: `DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD`, `SSH_PRIVATE_KEY`, `SSH_PASS`.
- Workflow da doi image tag sang `huyhoang204205/mln111:latest`.
- Workflow da pull service `mln111`.
- VPS co thu muc deploy khop voi lenh `cd` trong workflow.
- `docker-compose.yml` tren VPS co service `mln111`.
- `.env` tren VPS co `PORT`, `CLIENT_PORT`, `CLIENT_URL`, `NEXT_PUBLIC_SERVER_URL`.
- Port `25577` va `25578` da mo tren VPS/firewall/cloud provider.

Chay pipeline bang mot trong hai cach:

- Push code len branch `main`.
- Vao GitHub Actions -> chon workflow -> `Run workflow`.

## 8. Verify deployment

Kiem tra GitHub Actions:

- Job `build-and-push-image` phai login Docker Hub thanh cong.
- Step `Build and push` phai push image `huyhoang204205/mln111:latest`.
- Job `deploy` phai SSH thanh cong vao VPS.
- Lenh `docker compose pull mln111` khong duoc bao `no such service`.

Kiem tra tren VPS:

```bash
cd /home/huyhoang204205/Documents/mln111
docker compose ps
docker compose logs -f mln111
```

Kiem tra server health:

```bash
curl http://localhost:25578/health
```

Neu dung public IP:

```bash
curl http://115.73.218.193:25578/health
```

Kiem tra multiplayer:

1. Mo game bang 2 trinh duyet hoac 2 profile khac nhau.
2. Dang nhap 2 username khac nhau.
3. Di chuyen mot player va xem player con lai co thay realtime khong.
4. Gui chat va kiem tra tin nhan hien o client con lai.

## 9. Troubleshooting

### Docker login failed

Kiem tra lai `DOCKERHUB_USERNAME` va `DOCKERHUB_PASSWORD`. Neu dung 2FA, hay dung Docker Hub access token thay cho password.

### SSH failed

Kiem tra:

- `SSH_PRIVATE_KEY` dung format private key day du.
- Public key tu private key da nam trong `/home/huyhoang204205/.ssh/authorized_keys`.
- VPS host van la `115.73.218.193`.
- User SSH van la `huyhoang204205`.

### no such service: vnr202 hoac mln131

Workflow va `docker-compose.yml` dang khong cung ten service. Doi tat ca ve `mln111`:

- Workflow: `docker compose pull mln111`.
- Compose: `services: mln111:`.

### image not found

Kiem tra image tag trong workflow va compose phai giong nhau:

```text
huyhoang204205/mln111:latest
```

Neu Docker Hub repo la private, chay `docker login` tren VPS.

### Socket.IO khong connect

Kiem tra:

- `NEXT_PUBLIC_SERVER_URL` dung public URL cua multiplayer server.
- URL do truy cap duoc tu browser cua nguoi choi.
- Port `25578` da mo.
- `CLIENT_URL` dung public URL cua frontend de server cho phep CORS.
- Build args trong GitHub Actions va `.env` tren VPS dang dung cung URL.

### Container chay nhung frontend khong vao duoc

Kiem tra port map:

```yaml
ports:
  - "25577:25577"
  - "25578:25578"
```

Sau do kiem tra log:

```bash
docker compose logs -f mln111
```
