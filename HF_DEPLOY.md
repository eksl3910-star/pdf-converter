# PC 꺼도 되고 · 카드 없이 · 무료 배포

**Hugging Face Spaces**에 올리면 PC 없이 24시간(슬립 후 자동 깨움) 사용할 수 있습니다.

| | Hugging Face | Render | PC + Tunnel |
|--|-------------|--------|-------------|
| 카드 | **불필요** | 필요 | 불필요 |
| PC 켜기 | **불필요** | 불필요 | 필요 |
| 비용 | **무료** | 유료 | 무료 |
| 전체 변환 | **가능** | 가능 | 가능 |

> 48시간 동안 아무도 안 쓰면 슬립 → 다음 접속 시 1~2분 뒤 깨어남 (첫 변환만 느림)

---

## 본인만 할 것 (5분, 브라우저만)

### 1. Hugging Face 가입
https://huggingface.co/join  
→ **GitHub로 로그인** (카드 없음)

### 2. Space 만들기
https://huggingface.co/new-space

| 항목 | 값 |
|------|-----|
| Space name | `pdf-converter` |
| License | MIT |
| SDK | **Docker** |
| Hardware | **CPU basic (Free)** |
| Repo | **eksl3910-star/pdf-converter** (GitHub 연동) |

**Create Space** 클릭

### 3. Space 설정
Space → **Settings** (톱니바퀴)

| 설정 | 값 |
|------|-----|
| **Dockerfile path** | `Dockerfile.hf` |
| **App port** | `7860` |

Save

### 4. 빌드 대기
**Logs** 탭에서 빌드 10~20분 (LibreOffice 설치 때문에 처음은 김)

### 5. 접속
```
https://huggingface.co/spaces/본인아이디/pdf-converter
```
또는 Space 상단 **View the App** 링크

---

## 비밀번호 (선택)

Space → **Settings** → **Repository secrets** 또는 **Variables**:

| Key | Value |
|-----|-------|
| `SITE_PASSWORD` | 원하는 비밀번호 |

---

## Render는?

**Cancel** 하셔도 됩니다. Render는 카드 + 유료 플랜이 필요합니다.

---

## 문제 해결

| 증상 | 해결 |
|------|------|
| Build failed | Logs 확인 → GitHub에 최신 코드 push 됐는지 확인 |
| Application Error | Logs에서 `node server.js` 실행 확인 |
| 변환 느림 | 무료 슬립에서 깨어나는 중 — 1~2분 후 재시도 |
