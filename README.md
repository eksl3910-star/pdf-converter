# 파일 변환 사이트

Word, Excel, PowerPoint, PDF, 이미지, HTML, 텍스트 파일을 변환하는 개인용 웹 앱입니다.

## 지원 변환 (11종)

| 변환 | 설명 |
|------|------|
| Word → PDF | DOCX, DOC |
| Excel → PDF | XLSX, XLS |
| PowerPoint → PDF | PPTX, PPT |
| PDF → Word | DOCX |
| 이미지 → PDF | JPG, PNG, WEBP |
| PDF → 이미지 | PNG/JPEG (다중 페이지 시 ZIP) |
| 텍스트 → PDF | TXT |
| HTML → PDF | HTML |
| PDF 병합 | 여러 PDF → 하나 |
| PDF 분할 | 페이지 범위 추출 |
| PDF 압축 | Ghostscript 압축 |

## 기술 스택

- **Frontend/API**: Next.js 15, TypeScript, Tailwind CSS 4
- **Office → PDF**: Gotenberg (LibreOffice)
- **PDF → Word**: pdf2docx (Python FastAPI)
- **PDF 도구**: pdf-lib, Ghostscript, poppler-utils
- **배포**: Docker Compose + Cloudflare Tunnel

## 클라우드 서버 배포 (Render — 터미널 불필요)

**Cloudflare Pages만으로는 Office 파일 변환이 불가능**합니다. (LibreOffice/Gotenberg 필요)

PC를 켜 두지 않아도 되는 **클라우드 서버 배포**는 Render를 사용합니다.

### 배포 방법 (브라우저만)

1. **GitHub**에 이 프로젝트 업로드
2. **[Render.com](https://render.com)** 가입 (GitHub 연동)
3. **New → Blueprint** → repo 선택 → **Apply**
4. 생성된 URL 접속 (예: `https://pdf-converter-xxxx.onrender.com`)

자세한 단계: [`DEPLOY.md`](DEPLOY.md)

> Render 무료 플랜은 15분 미사용 시 슬립 → 첫 접속 시 30초~1분 대기. 항상 켜두려면 유료 플랜($7/월~) 필요.

---

## 빠른 시작 (Windows, Docker 없이)

Docker가 없어도 **일부 변환**은 바로 사용할 수 있습니다.

```powershell
cd C:\Users\win11pro\Desktop\project\pdf

# 1회 설정 (Python venv + 의존성)
pnpm setup:windows

# 개발 서버 실행 (pdf2docx 자동 시작)
pnpm dev:windows
```

브라우저: http://localhost:3000

| 변환 | Docker 없이 |
|------|-------------|
| PDF 병합/분할, 텍스트→PDF, 이미지→PDF | 바로 사용 |
| PDF→Word | Python 서비스 자동 실행 |
| Word/Excel/PPT→PDF | **LibreOffice** 설치 시 사용 ([다운로드](https://www.libreoffice.org/download/download/)) |
| PDF→이미지, PDF 압축 | poppler, Ghostscript 설치 필요 (아래 참고) |
| HTML→PDF | Docker(Gotenberg) 필요 |

### Windows 추가 도구 (선택)

```powershell
# PDF→이미지용
winget install oschwartz10612.Poppler

# PDF 압축용 - Ghostscript 수동 설치
# https://ghostscript.com/releases/gsdnld.html
# 설치 후 gs 명령이 PATH에 있어야 합니다
```

---

## 빠른 시작 (Docker - 전체 기능)

Docker Desktop이 설치되어 있어야 합니다.

```powershell
# Docker Desktop 설치 (미설치 시)
winget install Docker.DockerDesktop
# 설치 후 PC 재시작 → Docker Desktop 실행

cd C:\Users\win11pro\Desktop\project\pdf
copy .env.example .env
docker compose up -d --build
```

브라우저: http://localhost:3000

## 로컬 개발 (Node + Docker 일부)

Office/PDF→Word 변환을 쓰려면 Gotenberg와 pdf2docx 서비스가 필요합니다.

```powershell
# 1. 변환 서비스만 Docker로 실행
docker compose up -d gotenberg pdf2docx

# 2. Next.js 개발 서버
copy .env.example .env.local
# .env.local 에서:
# GOTENBERG_URL=http://localhost:3001
# PDF2DOCX_URL=http://localhost:8000

pnpm install
pnpm dev
```

로컬에서 PDF 병합/분할/압축/이미지 변환을 쓰려면 **Ghostscript**와 **poppler-utils**가 PATH에 있어야 합니다.

- Windows: [Ghostscript](https://ghostscript.com/releases/gsdnld.html), poppler (choco install poppler)
- Linux/Docker: Dockerfile에 포함됨

## 비밀번호 보호

`.env` 또는 `.env.local`에 설정:

```
SITE_PASSWORD=your-secret-password
```

설정 시 HTTP Basic Auth가 활성화됩니다.

## Cloudflare Tunnel 배포

1. Docker Compose 실행 (`docker compose up -d`)
2. [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) 설치
3. `cloudflare-tunnel.example.yml` 참고하여 터널 생성 및 DNS 연결

```powershell
cloudflared tunnel create pdf-converter
cloudflared tunnel route dns pdf-converter convert.yourdomain.com
cloudflared tunnel --config cloudflare-tunnel.example.yml run
```

PC가 켜져 있을 때 `https://convert.yourdomain.com` 으로 접속할 수 있습니다.

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `GOTENBERG_URL` | `http://gotenberg:3000` | Gotenberg API URL |
| `PDF2DOCX_URL` | `http://pdf2docx:8000` | pdf2docx 서비스 URL |
| `MAX_FILE_SIZE` | `0` (제한 없음) | 최대 업로드 크기 (바이트, 0=무제한) |
| `TEMP_DIR` | `/tmp/conversions` | 임시 파일 디렉토리 |
| `SITE_PASSWORD` | (비어 있음) | Basic Auth 비밀번호 |

## 프로젝트 구조

```
pdf/
├── docker-compose.yml
├── Dockerfile
├── src/
│   ├── app/              # Next.js 페이지 및 API
│   ├── components/       # UI 컴포넌트
│   └── lib/converters/   # 변환 엔진
└── services/pdf2docx/    # PDF → Word Python 서비스
```
