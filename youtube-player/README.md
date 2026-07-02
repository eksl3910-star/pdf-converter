# YouTube Player (Ya-ho! extract)

Ya-ho! 앱(`yaho-demo.web.app`)에서 **유튜브 플레이어 부분만 분리**한 작업 폴더입니다.  
메인 `pdf-converter` 앱과 **독립**이며, 여기서 플레이어를 개발·실험합니다.

## 로컬 실행

```bash
cd youtube-player
python3 -m http.server 8765
```

브라우저: http://localhost:8765

## 파일

| 파일 | 역할 |
|------|------|
| `index.html` | 플레이어 UI 마크업 |
| `player.css` | Win95 스타일 플레이어 스타일 |
| `player.js` | 재생 로직 전체 |
| `README.md` | 이 문서 |

## 저장

- `localStorage` 키: `yaho.player.v1`
- 필드: `playlist`, `cur`, `volume`, `repeat`

## 원본 출처

- HTML/CSS/JS: `https://yaho-demo.web.app/` 의 `#player`, `app.js` 848~966줄 부근
