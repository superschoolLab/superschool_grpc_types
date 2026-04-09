# @superschool/grpc-types

SuperSchool gRPC proto 정의 및 자동 생성 TypeScript 타입 패키지.

`superschool-api-v2`가 gRPC 서버로 제공하는 서비스의 **proto 원본**과 **TypeScript 인터페이스**를 한곳에서 관리하여, 각 백엔드에서 proto 복사 및 인터페이스 수동 작성을 제거합니다.

## 구조

```
superschool_grpc_types/
├── proto/                      # proto 원본 (런타임 proto-loader용)
│   ├── all-protos.proto        # 서비스 aggregator
│   └── super-school/
│       ├── user.proto
│       ├── student-user.proto
│       ├── teacher-user.proto
│       ├── parent-user.proto
│       ├── unified-user.proto
│       └── newsletter-v2.proto
├── generated/                  # ts-proto 자동 생성 (커밋 대상)
├── src/
│   ├── index.ts                # barrel export + proto 경로 헬퍼
│   └── clients.ts              # PascalCase 클라이언트 인터페이스
├── dist/                       # 빌드 결과 (gitignore)
└── scripts/
    └── generate.sh             # proto → TypeScript 생성 스크립트
```

## 제공하는 gRPC 서비스

| 서비스 | RPC 메서드 | proto 파일 |
|--------|-----------|-----------|
| `SuperSchoolUserService` | FindOneByOptions, ResetPassword, ResetPasswordAttemptCount | user.proto |
| `StudentUserService` | FindStudentList | student-user.proto |
| `TeacherUserService` | FindTeacherList | teacher-user.proto |
| `ParentUserService` | FindParentList | parent-user.proto |
| `UnifiedUserService` | FindUnifiedUserList, FindUnifiedUserDetail | unified-user.proto |
| `NewsletterV2Service` | findSubmissionEndTime, findNewsletterV2List | newsletter-v2.proto |

## 설치

Git 의존성으로 설치:

```bash
# npm
npm install github:superschoolLab/superschool_grpc_types#v0.1.0

# pnpm
pnpm add github:superschoolLab/superschool_grpc_types#v0.1.0
```

### peerDependencies

프로젝트에 아래 패키지가 이미 설치되어 있어야 합니다:

- `@grpc/grpc-js` >= 1.10.0
- `@nestjs/microservices` >= 10.0.0
- `rxjs` >= 7.0.0

## 사용법

### 1. gRPC 모듈 설정 (proto 경로)

```typescript
import { ALL_PROTOS_PATH, PROTO_INCLUDE_DIRS, SUPER_SCHOOL_PACKAGE } from '@superschool/grpc-types';

ClientsModule.register([
  {
    name: 'SUPER_SCHOOL_PACKAGE',
    transport: Transport.GRPC,
    options: {
      package: [SUPER_SCHOOL_PACKAGE],
      protoPath: [ALL_PROTOS_PATH],
      url: 'localhost:50051',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: PROTO_INCLUDE_DIRS,
      },
    },
  },
]);
```

### 2. 서비스에서 타입 사용

```typescript
import {
  StudentUserGrpcClient,
  FindStudentListRequest,
  FindStudentListResponse,
} from '@superschool/grpc-types';

@Injectable()
export class MyService implements OnModuleInit {
  private studentClient: StudentUserGrpcClient;

  constructor(@Inject('SUPER_SCHOOL_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.studentClient = this.client.getService<StudentUserGrpcClient>('StudentUserService');
  }

  async getStudents(dto: FindStudentListRequest): Promise<FindStudentListResponse> {
    const metadata = new Metadata();
    metadata.set('x-rpc-token', this.sharedToken);
    return lastValueFrom(this.studentClient.FindStudentList(dto, metadata));
  }
}
```

### 3. export 목록

**메시지 타입** - proto에서 자동 생성된 request/response 인터페이스:

```typescript
import {
  // User
  FindOneByOptionsRequest, FindOneByOptionsResponse,
  ResetPasswordRequest, ResetPasswordResponse,
  ResetPasswordAttemptCountRequest, ResetPasswordAttemptCountResponse,
  UserSimpleInfo, UserUnifiedUserInfo, UserRelatedInfo,
  // Student
  FindStudentListRequest, FindStudentListResponse,
  // Teacher
  FindTeacherListRequest, FindTeacherListResponse,
  // Parent
  FindParentListRequest, FindParentListResponse,
  // UnifiedUser
  FindUnifiedUserListRequest, FindUnifiedUserListResponse,
  FindUnifiedUserDetailRequest, FindUnifiedUserDetailResponse,
  UnifiedUserListItem, UnifiedUserDetailInfo, SchoolInfo, SchoolAccountInfo,
  // Newsletter
  FindNewsletterV2SubmissionListRequest, FindNewsletterV2SubmissionListResponse,
  FindNewsletterV2ListRequest, FindNewsletterV2ListResponse,
  NewsletterV2SubmissionListItem, NewsletterV2ListItem,
} from '@superschool/grpc-types';
```

**클라이언트 인터페이스** - `ClientGrpc.getService<T>()` 에 사용:

```typescript
import {
  StudentUserGrpcClient,
  TeacherUserGrpcClient,
  ParentUserGrpcClient,
  SuperSchoolUserGrpcClient,
  UnifiedUserGrpcClient,
  NewsletterV2GrpcClient,
} from '@superschool/grpc-types';
```

**proto 경로 헬퍼** - gRPC 모듈 설정에 사용:

```typescript
import {
  ALL_PROTOS_PATH,       // proto/all-protos.proto 절대 경로
  PROTO_INCLUDE_DIRS,    // proto-loader includeDirs 배열
  SUPER_SCHOOL_PACKAGE,  // 'super_school'
  PROTO_DIR,             // proto/ 디렉토리 절대 경로
} from '@superschool/grpc-types';
```

## 개발 (proto 수정 시)

### 사전 요구사항

- Node.js >= 18
- `protoc` (protobuf 컴파일러)

```bash
# macOS
brew install protobuf

# Ubuntu/Debian
apt install protobuf-compiler
```

### 타입 재생성

proto 파일 수정 후:

```bash
npm install           # 최초 1회
npm run generate      # proto → TypeScript 생성
npm run build         # TypeScript 빌드
```

### 버전 배포

```bash
npm version patch     # 0.1.0 → 0.1.1
git push --tags       # consumer에서 태그로 참조
```

consumer 업데이트:

```bash
npm install github:superschoolLab/superschool_grpc_types#v0.1.1
```

## 참고: 클라이언트 인터페이스 메서드명 규칙

- `src/clients.ts`의 클라이언트 인터페이스는 **PascalCase** 메서드명 사용 (`FindStudentList`)
- NestJS proto-loader `keepCase: true` 설정 시 런타임 프록시가 PascalCase로 동작하기 때문
- `generated/`의 ts-proto 생성 인터페이스는 camelCase (`findStudentList`) — 서버 컨트롤러 데코레이터용
