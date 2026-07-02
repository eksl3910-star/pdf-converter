# PC 꺼도 되고 · 내 도메인 · 슬립 없음 · 영구 무료

**Oracle Cloud Always Free** VPS에 올리면 Hugging Face 없이 24시간 사용할 수 있습니다.

| | Oracle Cloud | Hugging Face | PC + Tunnel |
|--|-------------|--------------|-------------|
| 카드 | 본인 확인만 (결제 없음) | 불필요 | 불필요 |
| PC 켜기 | **불필요** | 불필요 | 필요 |
| 내 도메인 | **✅ 가능** | ❌ (`hf.space`) | ✅ 가능 |
| 슬립/Paused | **없음** | 있음 | PC 끄면 중단 |
| 비용 | **영구 무료** | 무료 | 무료 |
| 전체 변환 | **가능** | 가능 | 가능 |

> ARM 서버 2 CPU + 12GB RAM — LibreOffice 포함 11종 변환 모두 가능

---

## 본인만 할 것 (약 30분, 브라우저 + SSH)

### 1. Oracle Cloud 가입

https://www.oracle.com/cloud/free/

- **신용/체크카드** 필요 (본인 확인용, **결제되지 않음**)
- 가상카드·선불카드는 거절될 수 있음
- **Home Region**은 나중에 바꿀 수 없으니 가까운 리전 선택 (도쿄 `ap-tokyo-1`, 서울 없으면 도쿄/오사카)

---

### 2. ARM 서버 만들기

Oracle Console → **Compute → Instances → Create instance**

| 항목 | 값 |
|------|-----|
| Name | `pdf-converter` |
| Image | **Ubuntu 22.04** (aarch64) |
| Shape | **Ampere** → `VM.Standard.A1.Flex` |
| OCPU | **2** |
| Memory | **12 GB** |
| Boot volume | 50 GB |
| Public IP | ✅ Assign a public IPv4 address |
| SSH key | **Generate a key pair** → `.key` 파일 저장 |

**Create instance** 클릭

> **"Out of host capacity"** 가 뜨면 다른 리전에서 다시 시도하거나, 몇 시간~며칠 후 재시도

---

### 3. 방화벽 열기 (Oracle Console)

**Networking → Virtual cloud networks → (본인 VCN) → Security Lists → Default Security List**

**Ingress Rules** 추가:

| Source | Protocol | Port | 설명 |
|--------|----------|------|------|
| `0.0.0.0/0` | TCP | **22** | SSH |
| `0.0.0.0/0` | TCP | **7860** | 앱 (테스트용) |
| `0.0.0.0/0` | TCP | **80** | HTTP (도메인용) |
| `0.0.0.0/0` | TCP | **443** | HTTPS (도메인용) |

---

### 4. 서버 접속 + 자동 설치

Windows PowerShell 또는 터미널:

```bash
# SSH 접속 (키 파일 경로와 IP는 본인 것으로 변경)
ssh -i ~/Downloads/ssh-key-2026-07-01.key ubuntu@서버공인IP
```

서버에 접속한 뒤:

```bash
curl -fsSL https://raw.githubusercontent.com/eksl3910-star/pdf-converter/main/scripts/setup-oracle.sh | bash
```

또는 수동:

```bash
git clone https://github.com/eksl3910-star/pdf-converter.git
cd pdf-converter
bash scripts/setup-oracle.sh
```

> 첫 빌드 **15~25분** (LibreOffice 설치). `docker compose logs -f` 로 진행 확인

---

### 5. 접속 확인

브라우저에서:

```
http://서버공인IP:7860
```

변환 화면이 보이면 성공.

---

## 내 도메인 연결 (Cloudflare 추천)

도메인이 Cloudflare에 연결되어 있다면 **가장 쉽습니다**.

### A. Cloudflare DNS (추천)

Cloudflare Dashboard → **DNS → Records**

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `convert` | `서버공인IP` | Proxied (주황 구름) |

접속: `https://convert.내도메인.com`

Cloudflare가 SSL을 처리하므로 서버에는 **7860 포트만** 열려 있으면 됩니다.  
Nginx/Caddy 설정 없이 바로 HTTPS.

> Cloudflare → **SSL/TLS → Overview → Flexible** 또는 **Full**  
> 서버에 HTTPS가 없으면 **Flexible** 사용

### B. Caddy로 서버에서 HTTPS (Cloudflare 없을 때)

```bash
cd pdf-converter
cp Caddyfile.example Caddyfile
# Caddyfile 안의 convert.example.com 을 본인 도메인으로 수정
docker compose -f docker-compose.oracle.yml --profile with-caddy up -d --build
```

DNS에서 도메인 A 레코드를 **서버 공인 IP**로 연결.

---

## 비밀번호 (선택)

서버에서 `.env` 파일 수정:

```bash
cd ~/pdf-converter
nano .env
```

```
SITE_PASSWORD=원하는비밀번호
```

저장 후 재시작:

```bash
docker compose -f docker-compose.oracle.yml up -d
```

---

## 자주 쓰는 명령

```bash
cd ~/pdf-converter

# 로그 보기
docker compose -f docker-compose.oracle.yml logs -f

# 재시작
docker compose -f docker-compose.oracle.yml restart

# 최신 코드 반영
git pull
docker compose -f docker-compose.oracle.yml up -d --build

# 중지
docker compose -f docker-compose.oracle.yml down
```

---

## Hugging Face는?

Oracle로 옮기면 **HF Space는 Pause/삭제**해도 됩니다.  
슬립·Preparing Space 문제가 사라집니다.

---

## 문제 해결

| 즹상 | 해결 |
|------|------|
| Out of host capacity | 다른 리전 또는 나중에 재시도 |
| SSH 접속 안 됨 | Security List에서 22번 포트 열었는지 확인 |
| 페이지 안 열림 | 7860 포트 Ingress Rule 확인 |
| Build failed | `docker compose logs` 확인, RAM 12GB 할당했는지 확인 |
| Word 변환 실패 | `docker compose logs app` 에서 LibreOffice 오류 확인 |
| 도메인 HTTPS 안 됨 | Cloudflare Proxy 켰는지, DNS A 레코드 IP 맞는지 확인 |

---

## 요약

1. Oracle Cloud 가입 (카드 본인 확인만)
2. ARM Ubuntu 서버 생성 (2 CPU, 12GB)
3. 방화벽 22, 7860, 80, 443 열기
4. SSH → `setup-oracle.sh` 실행
5. `http://IP:7860` 확인
6. Cloudflare DNS로 `convert.내도메인.com` 연결

**끝.** PC 꺼도 되고, HF 없이, 내 주소로 24시간 사용 가능.
