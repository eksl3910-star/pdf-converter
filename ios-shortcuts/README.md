# 갤러리 전송 (단일 단축어)

갤러리 선택 → 카카오톡 / Google Drive / 내 iPhone (여러 개 선택 가능)

오류 시 **알림 제목 「김도훈」** — 별도 단축어 **불필요**

## 폴더

```
맛집 리스트/사진
맛집 리스트/동영상
```

(iCloud Drive 또는 내 iPhone에 생성)

Drive/iPhone 저장 시 **폴더 선택 창**이 뜹니다 → `맛집 리스트/사진` 또는 `맛집 리스트/동영상` 선택 (한 번 지정하면 이후 기억하는 경우 많음)

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
