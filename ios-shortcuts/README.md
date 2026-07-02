# 갤러리 전송 (단일 단축어)

갤러리 선택 → 카카오톡 / Google Drive / 내 iPhone (여러 개 선택 가능)

오류 시 **알림 제목 「김도훈」** — 별도 단축어 **불필요**

## 폴더

```
맛집 리스트/사진
맛집 리스트/비디오
```

(iCloud Drive, Google Drive, 또는 내 iPhone에 생성)

## ⚠️ 가져올 때 폴더 4개 각각 지정 (사진·비디오 따로)

**비디오가 사진 폴더로 가지 않습니다.** 사진/비디오는 필터로 나뉘고, **파일 저장 동작이 4개**입니다.

| 파일 저장 동작 | 저장 대상 | 지정할 폴더 |
|---------------|----------|------------|
| Google Drive · 사진 | 사진만 | `맛집 리스트/사진` |
| Google Drive · 비디오 | 비디오만 | `맛집 리스트/비디오` |
| 내 iPhone · 사진 | 사진만 | `맛집 리스트/사진` |
| 내 iPhone · 비디오 | 비디오만 | `맛집 리스트/비디오` |

단축어 **가져오기** 할 때 위 폴더를 **각각** 고르라는 창이 뜰 수 있습니다.  
안 뜨면 **편집** 화면에서 📁 주석 아래 **파일 저장** 4개를 각각 탭해서 폴더 지정.

## Mac 설치

```bash
cd ~/Downloads
curl -L -o gallery-transfer.shortcut "https://github.com/eksl3910-star/pdf-converter/raw/cursor/gallery-shortcut-4ecd/ios-shortcuts/gallery-transfer.shortcut"
shortcuts sign -m anyone -i gallery-transfer.shortcut -o signed.shortcut
```

## 오류 알림 (김도훈)

| 상황 | 메시지 |
|------|--------|
| 미선택 | 사진이나 동영상을 선택하지 않았어. |
| 목적지 없음 | 보낼 곳을 하나 이상 선택해줘. |
| Drive/iPhone 저장 불가 | (해당 위치) 저장 실패: … |
