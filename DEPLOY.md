# Render 클라우드 배포 가이드

**"No repositories found"** 가 뜨면 GitHub에 코드가 없거나 Render 권한이 없는 것입니다.  
아래 **1 → 2 → 3** 순서대로 진행하세요.

---

## 1단계: GitHub에 코드 올리기

### A. GitHub에서 새 저장소

1. https://github.com/new
2. 이름: `pdf-converter`
3. **Public** 선택
4. **Create repository**

### B. 코드 업로드

**GitHub Desktop (추천)**

1. https://desktop.github.com 설치
2. **File → Add local repository**
3. 경로: `C:\Users\win11pro\Desktop\project\pdf`
4. **Publish repository** → GitHub에 올리기

**PowerShell**

```powershell
cd C:\Users\win11pro\Desktop\project\pdf
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/본인아이디/pdf-converter.git
git push -u origin main
```

> Gmail `[GitHub] Please verify` 메일이 있으면 **먼저 인증**하세요.

---

## 2단계: Render ↔ GitHub 연결

Render 화면 **오른쪽 Git provider**:

1. **GitHub** → **Configure account** 클릭
2. GitHub 로그인 → Render 앱 **Install**
3. **Repository access**
   - `All repositories` 또는
   - `pdf-converter`만 선택
4. **Save**

**F5 새로고침** → repo 목록에 `pdf-converter` 표시

---

## 3단계: Blueprint 배포

1. **New → Blueprint**
2. `pdf-converter` 선택
3. **Apply**
4. 5~10분 후 `https://pdf-converter-xxxx.onrender.com` 생성

---

## 문제 해결

| 증상 | 해결 |
|------|------|
| No repositories found | 1단계(GitHub 업로드) + 2단계(Configure account) |
| Apply 실패 | Render → Logs 확인 |

배포 후 **SITE_PASSWORD**는 Render → pdf-converter → Environment 에서 설정하세요.
