# 갤러리 전송 (단일 단축어)

갤러리 선택 → 카카오톡 / Google Drive / 내 iPhone (여러 개 선택 가능)

오류 시 **알림 제목 「김도훈」** — 별도 단축어 **불필요**

## 폴더

```
맛집 리스트/사진
맛집 리스트/비디오
```

(iCloud Drive, Google Drive, 또는 내 iPhone에 생성)

## ⚠️ 가져온 뒤 한 번만 설정 (자동 저장용)

파일에서 만든 단축어는 **저장 폴더를 iPhone에서 직접 연결**해야 합니다. 안 하면 매번 폴더를 고르거나, 상위 폴더(맛집 리스트)에 저장될 수 있어요.

1. **단축어** → **갤러리 전송** → **편집**
2. **「파일 저장」** 동작 4개를 각각 탭 (사진/비디오 × Drive/iPhone)
3. **「저장 위치 묻기」** 꺼져 있는지 확인
4. **서비스** (Google Drive 또는 내 iPhone) 선택
5. **경로/폴더** 탭 → `맛집 리스트/사진` 또는 `맛집 리스트/비디오` 폴더 **열기**
6. **완료**

이후부터는 사진·동영상이 자동으로 해당 폴더에 저장됩니다.

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
