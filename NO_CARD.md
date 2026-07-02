# 카드 없이 배포하기

**가장 쉬운 방법:** 프로젝트 폴더에서 **`START.bat`** 더블클릭  
→ 자세한 설명: [`QUICKSTART.md`](QUICKSTART.md)

Render / Oracle / AWS 등은 **카드 등록**이 필요한 경우가 많습니다.  
**카드 없이** 쓰려면 아래 방법을 사용하세요.

---

## 방법: PC + Cloudflare Tunnel (무료, 카드 불필요)

| 항목 | 내용 |
|------|------|
| 비용 | **0원** |
| 카드 | **불필요** |
| PC | **켜 두는 동안** 접속 가능 |
| 기능 | **전체 11종 변환** (Docker 사용) |
| 다른 프로젝트 | **분리** (포트 13000, Docker 이름 `pdf-converter`) |

### 한 줄 실행

**`START.bat`** 더블클릭

또는

```powershell
cd C:\Users\win11pro\Desktop\project\pdf
pnpm start:public
```

중지: **`STOP.bat`** 또는 `pnpm stop:public`

### 순서

1. **Docker Desktop** 실행 (Engine running)
2. **`START.bat`** 더블클릭
3. 터미널에 **`https://xxxx.trycloudflare.com`** 주소 표시
4. 그 주소를 브라우저/폰에서 접속

> PC를 끄거나 **STOP.bat** 실행하면 접속 불가.  
> 다시 켤 때마다 URL이 **바뀔 수 있음** (Quick Tunnel).

---

## 왜 Cloudflare Pages만으로는 안 되나?

| | team / webserver | pdf-converter |
|--|------------------|---------------|
| Cloudflare만 | 가능 | **불가** |
| 이유 | 가벼운 API | LibreOffice(Gotenberg) 필요 |

Cloudflare Tunnel은 **Cloudflare에 서버를 올리는 게 아니라**,  
**내 PC의 Docker**를 인터넷에 **연결**해 주는 방식입니다.

---

## PC 없이 + 카드 없이?

**Word/Excel 변환 포함 전체 기능**을 동시에 만족하는 방법은 **사실상 없습니다.**

- 서버( Render 등 ) = 보통 카드 필요
- PC + Tunnel = 카드 불필요, PC는 켜야 함

---

## 고정 주소 (선택, 카드 불필요)

Cloudflare **무료 계정** + **본인 도메인**이 있으면:

```powershell
pnpm deploy:tunnel:named
```

`https://convert.내도메인.com` 처럼 **고정 URL** 가능 (PC는 여전히 켜야 함).
