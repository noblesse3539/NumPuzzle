# FOURCAST

세로형 모바일 웹 우선 숫자블록 생존 게임입니다. FOURCAST는 Stack Rush 하나로 플레이합니다. 현재 Next와 다음 Next를 읽고, 알맞은 네 개의 라인 버튼을 눌러 빨간 선에 닿기 전 블록을 제거하세요. 오답은 해당 라인에 패널티 블록을 쌓습니다.

## 실행

의존성 없이 정적 파일로 동작합니다. BGM의 Web Audio 버퍼를 읽기 위해 반드시 로컬 개발 서버를 실행한 뒤 브라우저에서 접속하세요. `index.html`을 `file://`로 직접 열면 브라우저 보안 정책상 BGM이 재생되지 않습니다.

~~~powershell
py -m http.server 4173
~~~

브라우저 주소:

~~~text
http://127.0.0.1:4173/
~~~

화면 폭이 800px 미만인 환경에서는 가로 화면을 세로 회전 안내로 막습니다. 데스크톱 브라우저에서 반응형을 확인할 때는 개발자 도구의 모바일 세로 뷰포트를 사용하면 됩니다.

Chrome 개발자 도구 콘솔에서 `window.FOURCAST.getState()`를 실행하면 BGM backend와 실제 loop 시작·끝 값을 확인할 수 있습니다. 정상적인 HTTP 실행에서는 `bgmBackend`가 `web-audio`여야 합니다.

## 구성

- index.html: 시작·플레이·게임 오버·도움말 화면
- styles.css: 반응형 모바일 UI, 파스텔 타일, 안전 영역, 애니메이션
- app.js: 시간 기반 게임 규칙 엔진과 렌더링 연결

게임 규칙은 DOM과 분리된 상태 객체와 순수 계산 함수 중심으로 작성해 추후 네이티브 렌더러로 옮길 수 있도록 구성했습니다. `window.FOURCAST.getState()`와 `window.FOURCAST.getStackRushStageProfile(stage)`는 로컬 검증용 읽기 API입니다. `getState()`에는 현재 `stage`, `stageRemoved`, `stageTarget`, `stageRemainingSeconds`, `combo`, `bestCombo`, `score`, `feedbackType`, `perfectOpportunityActive`, `perfectSuccessCount`, `perfectPathActive`와 `nextInsight` 상세 정보가 포함됩니다.

Pretendard Variable 웹폰트는 사용할 수 있을 때 로드하고, 네트워크가 없는 환경에서는 시스템 한글 폰트로 자동 대체됩니다.

## 프로덕션과 Stack Rush Lab 빌드

추가 패키지를 설치하지 않고 Node.js만으로 두 산출물을 만듭니다.

~~~text
node scripts/build.mjs
~~~

빌드가 끝나면 다음 폴더가 생깁니다.

- `dist/prod`: 실제 배포 전용 파일입니다. 서버와 호스팅에는 이 폴더만 올립니다.
- `dist/lab`: 개발자용 Stack Rush Lab입니다. 실제 서비스에 올리지 않습니다.

빌드 과정은 `dist/prod`의 파일을 허용 목록과 비교하고, Lab 파일·시나리오 이름·개발 전용 API 식별자가 발견되면 실패합니다. 이미 만든 산출물만 다시 검사하려면 다음 명령을 사용합니다.

~~~text
node scripts/verify-build.mjs
~~~

## Stack Rush Lab 실행

먼저 빌드한 다음 Lab 전용 서버를 실행합니다.

~~~text
node scripts/serve.mjs lab 4174
~~~

브라우저에서 다음 주소를 엽니다.

~~~text
http://127.0.0.1:4174/
~~~

왼쪽에는 390×844 실제 모바일 게임 프레임이 고정되어 있고, 오른쪽 패널만 스크롤됩니다. 패널에는 다음 개발 조작만 있습니다.

1. 정수형 Stack Rush 스테이지 선택과 시작·초기화
2. 일시정지·재개와 읽기 전용 상태 관찰
3. Stage 10→11 전환과 Stage 11 preview 3회 맥동·Next 변경 유지
4. 완벽 판정·콤보 점수·50점 보너스와 유일 선택·다중 선택·무효 경로
5. 실제 레드라인 판정 뒤 같은 시나리오 자동 초기화
6. 블록 높이의 3% 웨이브 대열과 패널티 리플로우
7. 웨이브 진입 전후 240ms 외곽 크기·간격·속도 측정

Lab에는 임의 코드 실행 콘솔이나 임의 상태 편집기가 없습니다. 시나리오는 필요한 보드·큐·스테이지만 준비하고, 이후 실제 라인 입력·적중 판정·스테이지 전환·레드라인 경로를 사용합니다.

프로덕션 산출물을 확인하려면 별도 포트로 실행합니다.

~~~text
node scripts/serve.mjs prod 4173
~~~

중요: 저장소 루트나 `dist/lab`을 배포 대상으로 사용하지 마세요. 실제 배포 대상은 항상 `dist/prod`입니다.

Stack Rush 점수는 콤보 1에서 10점, 콤보 2~10에서 11점, 콤보 11~20에서 12점이며 콤보 21부터는 `12 + floor((combo - 11) / 10)`점입니다. 완벽 경로를 두 번 연속 성공하면 해당 두 번째 제거에 50점을 더하고 `완벽` 피드백을 표시합니다. 완벽은 현재 Next와 일치하는 실제 라인 중, 그 라인의 다음 블록이 preview와 같고 제거 뒤 preview를 놓을 실제 라인이 정확히 하나일 때만 활성화됩니다.

## 빌드 파일 구성

- `lab/`: Lab 화면, 외부 조작 패널과 허용 목록형 메시지 브리지
- `scripts/build.mjs`: 프로덕션과 Lab 산출물 생성
- `scripts/verify-build.mjs`: 프로덕션 오염 및 산출물 구조 검사
- `scripts/serve.mjs`: 추가 패키지 없는 로컬 정적 서버

## 웹 배포

FOURCAST의 1차 배포 대상은 모바일 웹입니다. GitHub 저장소를 Cloudflare
Pages의 Git 연동에 연결하고 다음 값을 사용합니다.

```text
Production branch: master
Framework preset: None
Root directory: 저장소 루트
Build command: npm run build
Build output directory: dist/prod
Node version: 22
```

저장소 루트나 `dist/lab`을 공개하지 말고, Pages가 빌드한 `dist/prod`만
서비스합니다. Cloudflare Pages의 Git 연동을 사용하면 `master`에 push할 때
자동으로 새 배포가 생성됩니다. 직접 업로드로 시작하면 나중에 Git 연동으로
전환할 수 없으므로, 지속적으로 업데이트할 사이트에는 Git 연동을 사용합니다.

로컬에서 배포 전 확인합니다.

```text
node -v
npm -v
npm run build
npm run verify:build
npm run serve:prod
```

처음에는 Cloudflare가 제공하는 `pages.dev` 주소에서 휴대폰으로 확인한 뒤,
문제가 없을 때 custom domain을 연결합니다. apex domain을 사용할 경우
Cloudflare의 custom domain 설정에서 안내하는 nameserver를 적용하고,
subdomain을 사용할 경우 안내된 CNAME을 등록합니다.

## AdSense 준비

웹 광고는 AdMob이 아니라 AdSense를 사용합니다. 현재 `ads-config.js`의
`enabled` 값은 `false`이므로 광고 계정이 승인되기 전에는 광고 스크립트가
로드되지 않습니다.

AdSense 사이트 심사를 통과한 뒤 `ads-config.js`에 계정의 실제 값을 입력합니다.

```js
window.FOURCAST_AD_CONFIG = Object.freeze({
  enabled: true,
  client: "ca-pub-YOUR_PUBLISHER_ID",
  slots: Object.freeze({
    home: "YOUR_HOME_AD_SLOT_ID",
    gameOver: "YOUR_GAME_OVER_AD_SLOT_ID"
  })
});
```

값을 입력하기 전까지는 예시 문자열을 실제 서비스에 사용하지 않습니다.
광고는 홈과 게임오버 화면에서만 한 번씩 초기화되며, 플레이 중·도움말·설정
화면에는 나타나지 않습니다. 광고와 게임 조작부가 가까워지거나 작은 화면에서
레이아웃을 침범하면 광고를 숨기고 게임 화면을 우선합니다.

AdSense 연결 전 창작자가 해야 할 일은 다음과 같습니다.

1. custom domain과 공개 문의 방식을 결정합니다.
2. BGM, 이미지, 폰트의 상업적 이용 권리를 확인합니다.
3. AdSense 계정을 만들고 지급 정보와 세금 정보를 실제 수취인 기준으로
   입력합니다.
4. AdSense에서 사이트 소유권을 인증하고 사이트 심사를 요청합니다.
5. `ads-config.js`에 승인된 publisher ID와 광고 단위 ID를 입력합니다.
6. AdSense가 제공한 seller line을 `ads.txt`에 추가합니다.
7. custom domain을 선택한 뒤 `sitemap.xml`과 `robots.txt`의 URL 정보를
   최종 주소에 맞게 갱신합니다.

`privacy.html`에는 게임의 로컬 저장 데이터, 호스팅 로그, 외부 폰트 CDN,
AdSense 및 광고 파트너의 처리 가능성을 설명합니다. 이 페이지에는 광고
스크립트나 동의창 스크립트를 넣지 않습니다. 유럽경제지역·영국·스위스
이용자에게 개인화 광고를 제공할 때는 AdSense의 Privacy & messaging에서
Google 인증 CMP를 설정합니다.

초기 테스트에서는 광고가 비활성화되어도 정상입니다. AdSense 사이트 상태가
`Ready`가 된 뒤에만 실사용 광고 ID를 입력하고 다시 배포합니다.

## 몰입도 개선 이력: 수동 버스트

정답 16개로 충전한 뒤 하단 BURST 버튼을 누르면 낙하가 40% 속도로 느려집니다.
선택 가능한 6초 안에 4연속 정답을 완성하면 100점을 추가로 받습니다.
NEXT 블록 공급 대기와 일시정지에는 버스트 시간이 줄지 않습니다.
오답은 충전 4칸을 차감하거나 진행 중인 버스트를 종료합니다.
구현 설명, 검증 방법과 향후 과제는 [Astra 작업 문서](docs/Astra/0001_2026-09-08_몰입도_개선_구현과_향후과제.md)를 참고하세요.

### 추가 10회 개선과 통합 검증

NEXT·공급 흐름, 버스트 해소, 번개·알림, 효과음·진동·화음, 초보 안내,
기록 보존, 정지·키보드 조작을 추가했습니다. 이후 통합 테스트와 화면·재개 문제
수정을 마쳤고, 실제 production UI로 20스테이지를 클리어했습니다. 배포는 하지 않았습니다.

- [추가 10회 개선 총괄 및 회차별 기록](docs/Astra/0012_2026-09-08_추가_10회_개선_총괄.md)
- [당시 검증 결과·수정 내용·20스테이지 플레이·향후 과제](docs/Astra/0013_2026-09-08_통합_검증과_20스테이지_플레이.md)

### 후속 5회 개선과 당시 최종 플레이

정답 연결 경로, 화면별 난도 일치, 한 번의 NEXT 예약 입력, 버스트 막힘 연결,
반복 알림 제한을 구현했습니다. 다섯 회차 이후 기존 검사와 신규 9개 검사를 함께
통과했고 실제 UI로 20스테이지를 31,881점·679콤보로 클리어했습니다.

[후속 5회 구현·검증·플레이·다음 과제](docs/Astra/0019_2026-09-09_후속_5회_개선_총괄.md)를 참고하세요.

위 항목은 이전 규칙의 구현 이력입니다. 예약 입력은 아래 최신 작업에서 즉시 처리 방식으로 교체했습니다.

### 실제 후기 대응: 90초 라운드와 즉시 연속 발사

최대 90초 라운드, 빠른 단계 전개, 애니메이션과 분리한 즉시 발사, 공급 대기 단축,
규칙별 기록 보존과 일시정지 정렬을 구현했습니다.

- [전체 작업 기록 목차](docs/Astra/0000_작업기록_목차.md)
- [최신 구현·검증·향후 과제](docs/Astra/0027_2026-09-09_실제후기_6회_개선_총괄.md)

### 최신 규칙: 로그 압박 곡선과 무제한 생존

90초 자동 종료를 제거하고 빨간선 종료 조건을 복원했습니다. 1스테이지 30초 기준 낙하에서 시작하고, 5스테이지마다 로그 기준선에 도달하도록 지수 강도 2.4로 가속합니다. 위 90초 규칙은 이전 구현 이력입니다.

[구현·검증·다음 과제](docs/Astra/0028_2026-09-09_로그_압박곡선과_생존조건_복원.md)

최신 공동 조율 결과: **스테이지 24초**, 지수 강도 2.4의 압박 곡선, 빨간선 종료, 이메일 문의와 간소화 도움말. [최종 정리·검증·Git 전달](docs/Astra/0032_2026-09-09_공동조율_최종정리와_Git_전달.md).
