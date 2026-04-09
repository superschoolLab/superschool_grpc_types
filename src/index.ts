// 자동 생성된 메시지 타입 re-export
export * from "../generated/user";
export * from "../generated/student-user";
export * from "../generated/teacher-user";
export * from "../generated/parent-user";
export * from "../generated/unified-user";
export * from "../generated/newsletter-v2";

// PascalCase 클라이언트 인터페이스 (keepCase: true 환경용)
export * from "./clients";

// proto 경로 헬퍼
import { join } from "path";

export const PROTO_DIR = join(__dirname, "..", "..", "proto");
export const ALL_PROTOS_PATH = join(PROTO_DIR, "all-protos.proto");
export const PROTO_INCLUDE_DIRS = [PROTO_DIR, join(PROTO_DIR, "super-school")];
export const SUPER_SCHOOL_PACKAGE = "super_school";
