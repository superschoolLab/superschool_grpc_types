---
name: proto-guide
description: SuperSchool gRPC proto 파일 작성 가이드 및 네이밍 규칙. proto 추가/수정 시 호출.
trigger: proto 파일 추가, 수정, gRPC 서비스 추가, RPC 추가
---

# SuperSchool Proto 작성 가이드

## proto 파일 위치

```
proto/super-school/{서비스명}.proto
```

## 네이밍 규칙

### 파일명
- **kebab-case**: `student-user.proto`, `newsletter-v2.proto`
- 서비스 도메인 단위로 1파일 1서비스

### package
- 모든 proto 파일: `package super_school;`

### Service 이름
- **PascalCase + Service 접미사**: `StudentUserService`, `NewsletterV2Service`
- 자동 생성 시 `Service` → `GrpcClient`로 변환됨
  - 예: `StudentUserService` → `StudentUserGrpcClient`

### RPC 메서드명
- **PascalCase 사용** (권장): `FindStudentList`, `ResetPassword`
- proto-loader `keepCase: true` 설정으로 런타임에서도 동일한 casing 유지
- consumer에서 `this.client.FindStudentList(dto, metadata)` 형태로 호출

### Message 이름
- **PascalCase**: `FindStudentListRequest`, `FindStudentListResponse`
- Request/Response 접미사 필수
- 공유 메시지는 `user.proto`에 정의 후 `import "user.proto";`로 참조

### 필드명
- **camelCase**: `schoolId`, `userId`, `hasNext`, `totalCount`
- optional 필드: `optional string name = 3;`

## proto 파일 템플릿

```protobuf
syntax = "proto3";

package super_school;

// 다른 proto의 메시지 사용 시
import "user.proto";

service ExampleService {
  rpc FindExampleList(FindExampleListRequest) returns (FindExampleListResponse);
  rpc FindExampleDetail(FindExampleDetailRequest) returns (FindExampleDetailResponse);
}

// --- Request ---
message FindExampleListRequest {
  int32 page = 1;
  int32 limit = 2;
  optional string name = 3;
  int32 schoolId = 4;
}

message FindExampleDetailRequest {
  int32 id = 1;
}

// --- Response ---
message ExampleItem {
  int32 id = 1;
  string title = 2;
  string createdAt = 3;
}

message FindExampleListResponse {
  repeated ExampleItem data = 1;
  int32 totalCount = 2;
  int32 currentPage = 3;
  int32 limit = 4;
  int32 totalPage = 5;
  bool hasNext = 6;
  bool hasPrev = 7;
}

message FindExampleDetailResponse {
  ExampleItem data = 1;
}
```

## 새 서비스 추가 절차

1. `proto/super-school/{서비스명}.proto` 파일 생성 (위 템플릿 참고)
2. 코드 생성 및 빌드:
   ```bash
   pnpm run generate   # generated/, clients.ts, index.ts, all-protos.proto 자동 갱신
   pnpm run build      # dist/ 빌드
   ```
3. 커밋 & 푸시

> **그 외 파일은 건드릴 필요 없습니다.** `all-protos.proto`, `scripts/generate.sh`, `src/index.ts`, `src/clients.ts`는 모두 proto 파일을 스캔해서 자동 생성됩니다.

## 기존 서비스에 RPC 추가 절차

1. 해당 `.proto` 파일에 rpc + message 추가
2. `pnpm run generate && pnpm run build`
3. 커밋 & 푸시

## 자동 생성되는 파일

`pnpm run generate` 실행 시 아래 파일이 전부 자동 생성됩니다. **직접 수정하지 마세요.**

| 파일 | 생성 도구 | 내용 |
|------|----------|------|
| `generated/*.ts` | ts-proto (protoc) | 메시지 인터페이스 + encode/decode + camelCase 서비스 클라이언트 |
| `src/clients.ts` | generate-clients.js | proto 원본 casing 클라이언트 인터페이스 (consumer용) |
| `src/index.ts` | generate-clients.js | generated/*.ts 재export + proto 경로 헬퍼 |
| `proto/all-protos.proto` | generate-clients.js | 런타임 proto-loader용 aggregator |
