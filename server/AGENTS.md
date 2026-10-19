# server/AGENTS.md

## Module Context

Bun 런타임의 AI API 프록시. 클라이언트 요청을 Anthropic 또는 Google API로 중계하고 응답을 react-live 실행 가능 코드로 정규화한다. 루트 AGENTS.md의 보안/파이프라인 규칙이 여기에도 적용된다.

## Tech Stack & Constraints

- 런타임은 Bun이다 (`Bun.serve`, `process.env`). Node 전용 API나 Express 같은 프레임워크를 추가하지 않는다.
- 외부 API 호출은 SDK 없이 `fetch`로 직접 한다 (server/index.ts:69, 101). 새 provider도 같은 방식을 따른다.

## Implementation Patterns

- 순수 함수는 `generator.ts`, 재시도/폴백 로직은 `fallback.ts`에 둔다. 각각 `*.test.ts`가 짝으로 있다.
- 모델 폴백은 `withModelFallback(models, attempt)`를 쓴다 (server/fallback.ts:3). Google 모델 우선순위는 `GOOGLE_MODELS` 배열 순서다 (server/index.ts:5).

## Testing Strategy

- `bun run test`로 실행한다 (server/**/*.test.ts가 포함됨). `bun test` 사용 금지.
- 테스트가 있는 곳: `generator.ts`, `fallback.ts`. 테스트가 없는 곳: `index.ts` (서버 기동과 라우팅). 라우팅이나 에러 매핑을 바꿀 때는 로직을 순수 함수로 빼서 테스트를 붙인다.

## Local Golden Rules

- Anthropic과 Google 경로는 비대칭이다. 한쪽에 있는 처리가 다른 쪽에 없을 수 있음을 전제로 한다.
  - 모델 폴백: Google만 있다 (server/index.ts:134-136). Anthropic은 모델 하나 고정이다 (server/index.ts:77).
  - 잘림(MAX_TOKENS) 감지: Google만 있다 (server/index.ts:123-125). Anthropic은 `max_tokens: 4096`이고 잘림 검사가 없다 (server/index.ts:78).
  - provider 기본값이 서로 다르다. 서버는 `anthropic` (server/index.ts:161), UI는 `google` (src/App.tsx:16). 둘 중 하나를 바꾸면 다른 쪽 영향도 확인한다.
- 에러 매핑은 메시지 문자열에 상태 코드가 들어 있는지에 의존한다 (`includes('503')`, `includes('429')`: server/index.ts:194, 201). provider 에러는 `... API error: ${status}` 형식을 유지하고, 이 형식을 바꾸면 매핑도 같이 고친다.
- Google API 키는 URL 쿼리스트링에 들어간다 (server/index.ts:99). 요청 URL을 로그나 에러 메시지에 출력하지 않는다.
- 서버가 `Provider` 타입을 자체 정의한다 (server/index.ts:57). 클라이언트는 `src/types/index.ts`에 따로 가지고 있어 두 정의가 자동으로 동기화되지 않는다. provider를 추가하면 양쪽을 모두 수정한다.
