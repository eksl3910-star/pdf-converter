# 3분 시작 (PC + 공개 URL)

카드 없음 · Hugging Face 없음 · Oracle 없음  
**이 폴더만** 사용합니다. 다른 프로젝트와 포트/컨테이너가 분리됩니다.

---

## 1. Docker Desktop 실행

Docker Desktop을 켜고 **Engine running** 상태인지 확인.

---

## 2. 실행 (둘 중 하나)

### 방법 A — 더블클릭 (제일 쉬움)

프로젝트 폴더에서 **`START.bat`** 더블클릭

### 방법 B — 터미널

```powershell
cd C:\Users\win11pro\Desktop\project\pdf
pnpm start:public
```

---

## 3. 주소 복사

터미널에 나오는 주소:

```
https://xxxx.trycloudflare.com   ← 폰/다른 PC에서 접속
http://localhost:13000           ← 이 PC에서만
```

> 처음 실행은 Docker 빌드 때문에 **5~15분** 걸릴 수 있습니다.

> **큰 파일(50MB+):** 공개 URL(`trycloudflare.com`)에서 끊길 수 있음 → **http://localhost:13000** 사용

---

## 중지

- **터널만 끄기:** 실행 창에서 `Ctrl+C`
- **완전 중지:** **`STOP.bat`** 더블클릭 또는 `pnpm stop:public`

---

## 이 프로젝트만 쓰는 이유

| 항목 | 값 |
|------|-----|
| Docker 프로젝트명 | `pdf-converter` |
| 로컬 포트 | **13000** (다른 Next.js 3000과 충돌 없음) |
| 컨테이너 | `pdf-converter-app`, `pdf-converter-gotenberg`, `pdf-converter-pdf2docx` |
| 설정 파일 | `docker-compose.public.yml` (기존 `docker-compose.yml`과 별도) |

---

## 지원 변환 (11종)

Word/Excel/PPT → PDF, PDF → Word, 이미지, 텍스트, HTML, PDF 병합/분할/압축

---

## 문제 해결

| 즹상 | 해결 |
|------|------|
| Docker 오류 | Docker Desktop 실행 후 재시도 |
| 포트 사용 중 | `STOP.bat` 실행 후 다시 `START.bat` |
| URL 안 나옴 | 1~2분 더 기다린 후 `.public-url.txt` 확인 |
| 변환 실패 | Docker 로그: `docker compose -f docker-compose.public.yml -p pdf-converter logs -f` |
