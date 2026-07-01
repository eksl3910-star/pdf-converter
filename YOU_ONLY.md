# ✅ 본인만 하면 되는 것 (3가지)

코드·배포 설정·git 커밋은 모두 준비해 두었습니다.  
**아래 3가지만** 본인 계정으로 진행하면 됩니다.

---

## 1. GitHub에 올리기 (5분)

1. https://github.com/new 접속
2. Repository name: **`pdf-converter`**
3. **Public** → **Create repository**
4. **GitHub Desktop** 설치: https://desktop.github.com
5. GitHub Desktop → **File → Add local repository**
   - 폴더: `C:\Users\win11pro\Desktop\project\pdf`
6. **Publish repository** 클릭 → GitHub에 업로드

> Gmail `[GitHub] Please verify` 메일이 있으면 **먼저 인증**하세요.

---

## 2. Render ↔ GitHub 연결 (2분)

1. https://dashboard.render.com → **New → Blueprint**
2. 오른쪽 **GitHub → Configure account** 클릭
3. GitHub에서 Render **Install** → **`pdf-converter`** 저장소 허용
4. **F5** 새로고침 → `pdf-converter` 선택

---

## 3. Apply → 배포 (10분)

1. **Apply** 클릭
2. 결제/플랜 확인 (서비스 3개 → **Starter 약 $7/서비스/월**, 무료로는 1개 웹만 가능)
3. 배포 완료 후 URL 접속: `https://pdf-converter-xxxx.onrender.com`
4. Render → **pdf-converter** → **Environment** → `SITE_PASSWORD` 확인/변경

---

## 끝

배포 후 PC 꺼도 사이트 접속 가능합니다.

문제 생기면 Render 대시보드 → **Logs** 확인 후 알려주세요.
