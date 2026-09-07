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
