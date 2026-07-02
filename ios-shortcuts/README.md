# 갤러리 전송 + 김도훈 (오류 알림)

## 필요한 단축어 2개

1. **김도훈** — 오류 메시지 → 알림 (제목: 김도훈)
2. **갤러리 전송** — 갤러리 선택 → 여러 곳 전송

`kim-dohoon.shortcut` = 김도훈 템플릿 (무작위 없음, 입력 → 알림)

## 확인 가능한 오류 → 모두 김도훈 알림

| 상황 | 김도훈 메시지 |
|------|----------------|
| 사진·동영상 미선택 | 사진이나 동영상을 선택하지 않았어. |
| 보낼 곳 미선택 | 보낼 곳을 하나 이상 선택해줘. |
| Drive 저장 불가 | Google Drive 저장 실패: 사진·동영상으로 인식된 파일이 없어. |
| 내 iPhone 저장 불가 | 내 iPhone 저장 실패: 사진·동영상으로 인식된 파일이 없어. |

※ 폴더 없음·권한 오류 등 **실행 중 실패**는 iOS 제한으로 김도훈 자동 호출 불가

## Mac 설치

```bash
cd ~/Downloads
# 두 파일 모두 서명 후 iPhone으로 전송
shortcuts sign -m anyone -i kim-dohoon.shortcut -o signed-kim.shortcut
shortcuts sign -m anyone -i gallery-transfer.shortcut -o signed-gallery.shortcut
```

## 김도훈 단축어 (직접 만든 경우)

무작위·텍스트 목록 **삭제** → **단축어 입력** → **알림**(제목 김도훈, 본문 입력)

이름이 **「김도훈」** 이어야 갤러리 전송에서 찾습니다.
