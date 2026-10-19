# AGENTS.md

## Operational Commands

패키지 매니저는 bun 고정이다 (`bun.lock` 존재). npm, yarn, pnpm 사용 금지.

```bash
bun install        # 의존성 설치
bun run dev        # API 서버(:3002) + Vite(:5173) 동시 실행
bun run test       # vitest run (src/**, server/** 테스트 모두 포함)
bun run lint       # eslint
bun run build      # tsc -b && vite build (변경 후 타입/빌드 검증에 사용)
```

- 테스트는 반드시 `bun run test`로 실행한다. `bun test`는 Bun 내장 러너를 호출하여 `vite.config.ts`의 jsdom 환경과 `src/test/setup.ts`를 사용하지 않는다 (vite.config.ts:16-21).
- UI 변경 후에는 `bun run build`와 `bun run test`를 모두 통과시킨다.

## Golden Rules

### Immutable

- API 키 값을 클라이언트로 내려보내지 않는다. `/api/config`는 키 존재 여부(boolean)만 반환한다 (server/index.ts:147-156). 키 값을 응답, 로그, 에러 메시지에 포함하지 않는다.
- `.env`는 커밋하지 않는다. 현재 `.gitignore`에 `.env` 항목이 없고 `*.local`만 있다 (.gitignore:13). git 저장소를 만들거나 커밋하기 전에 `.env`를 `.gitignore`에 추가한다. `.env`는 `.worktreeinclude`로 워크트리에 복사되는 파일이다.
- 서버 포트와 Vite 프록시 대상은 항상 같아야 한다. 포트 3002는 server/index.ts:139와 vite.config.ts:10 두 곳에 있으며, 한쪽만 바꾸면 `/api` 요청이 전부 실패한다.

### AI 응답 -> 미리보기 파이프라인 (서버와 클라이언트에 걸침)

- 미리보기는 react-live `noInline` 모드이며 코드 안에 `render(<Component />)` 호출이 있어야 그려진다 (src/components/LivePreview.tsx:14, server/generator.ts:12-14). 이 규약을 깨는 변경 금지.
- 같은 위험을 두 곳에서 막고 있으므로 한쪽만 제거하지 않는다.
  - `render()` 호출: SYSTEM_PROMPT 지시 (server/index.ts:12) + `ensureRenderCall` 보정 (server/index.ts:188).
  - 마크다운 코드펜스: SYSTEM_PROMPT 지시 (server/index.ts:16) + `stripCodeFences` 제거 (server/index.ts:188).
- SYSTEM_PROMPT의 `import 금지`, `TypeScript 문법 금지`, `인라인 스타일만` 규칙은 react-live 런타임 제약에서 나온 것이다 (server/index.ts:10-11, 20). 완화하면 미리보기가 런타임 에러로 깨진다.

### Do

- 사용자에게 보이는 문구는 한국어로 쓴다 (테스트가 문구로 버튼을 찾는다: src/components/PromptInput.test.tsx:9, 18, 27). 버튼 라벨 `컴포넌트 생성`, `생성 중...`을 바꾸면 테스트도 같이 고친다.
- 새 순수 로직은 `server/generator.ts`처럼 부수효과 없는 모듈에 두고 옆에 `*.test.ts`를 만든다 (아래 서버 규칙 참고).

### Don't

- `server/index.ts`에 테스트가 필요한 로직을 직접 쓰지 않는다. 이 파일은 import 시점에 `Bun.serve`를 실행해 단위 테스트가 불가능하다 (server/index.ts:138).
- UI 스타일을 인라인이나 새 CSS 파일로 흩뿌리지 않는다. 전역 토큰은 `src/index.css`, 컴포넌트 스타일은 `src/App.css` 한 곳에 있다. 창 모양 UI는 `.window`, `.win-title`, `.win-body` 클래스를 재사용한다.

## Project Context

프롬프트를 입력하면 AI가 React 컴포넌트 코드를 생성하고 react-live로 즉시 미리보기하는 도구.

Tech Stack: React 19, TypeScript, Vite 8, react-live, Bun(API 프록시 서버), Vitest, Testing Library, Galmuri(픽셀 폰트).

기존 문서: [README.md](./README.md)에 설치와 실행 방법이 있다.

## Standards & References

- 커밋은 `.claude/skills/commit` 스킬을 따른다: 한국어 `타입: 요약` (feat/fix/refactor/chore), 사용자 승인 후 실행, `git push`는 요청 시에만.
- 서버(Bun) 영역 규칙은 [server/AGENTS.md](./server/AGENTS.md)를 따른다.

## Maintenance Policy

이 문서의 규칙과 실제 코드가 어긋나면(포트 변경, 파이프라인 변경, 파일 이동 등) 작업을 마치기 전에 AGENTS.md 업데이트를 제안한다. 인용한 파일·라인이 바뀌었으면 근거를 다시 확인한다.
