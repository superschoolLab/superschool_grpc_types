/**
 * gRPC 클라이언트 인터페이스 (PascalCase 메서드명)
 *
 * NestJS ClientGrpc.getService()에서 proto-loader keepCase: true 설정 시
 * 런타임 프록시의 메서드명이 PascalCase로 생성됨.
 * ts-proto는 camelCase로 생성하므로, consumer용 PascalCase 인터페이스를 별도 제공.
 */
import type { Metadata } from "@grpc/grpc-js";
import type { Observable } from "rxjs";
import type {
  FindStudentListRequest,
  FindStudentListResponse,
  FindTeacherListRequest,
  FindTeacherListResponse,
  FindParentListRequest,
  FindParentListResponse,
  FindOneByOptionsRequest,
  FindOneByOptionsResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResetPasswordAttemptCountRequest,
  ResetPasswordAttemptCountResponse,
  FindUnifiedUserListRequest,
  FindUnifiedUserListResponse,
  FindUnifiedUserDetailRequest,
  FindUnifiedUserDetailResponse,
  FindNewsletterV2SubmissionListRequest,
  FindNewsletterV2SubmissionListResponse,
  FindNewsletterV2ListRequest,
  FindNewsletterV2ListResponse,
} from "./index";

export interface StudentUserGrpcClient {
  FindStudentList(
    request: FindStudentListRequest,
    metadata?: Metadata
  ): Observable<FindStudentListResponse>;
}

export interface TeacherUserGrpcClient {
  FindTeacherList(
    request: FindTeacherListRequest,
    metadata?: Metadata
  ): Observable<FindTeacherListResponse>;
}

export interface ParentUserGrpcClient {
  FindParentList(
    request: FindParentListRequest,
    metadata?: Metadata
  ): Observable<FindParentListResponse>;
}

export interface SuperSchoolUserGrpcClient {
  FindOneByOptions(
    request: FindOneByOptionsRequest,
    metadata?: Metadata
  ): Observable<FindOneByOptionsResponse>;
  ResetPassword(
    request: ResetPasswordRequest,
    metadata?: Metadata
  ): Observable<ResetPasswordResponse>;
  ResetPasswordAttemptCount(
    request: ResetPasswordAttemptCountRequest,
    metadata?: Metadata
  ): Observable<ResetPasswordAttemptCountResponse>;
}

export interface UnifiedUserGrpcClient {
  FindUnifiedUserList(
    request: FindUnifiedUserListRequest,
    metadata?: Metadata
  ): Observable<FindUnifiedUserListResponse>;
  FindUnifiedUserDetail(
    request: FindUnifiedUserDetailRequest,
    metadata?: Metadata
  ): Observable<FindUnifiedUserDetailResponse>;
}

export interface NewsletterV2GrpcClient {
  findSubmissionEndTime(
    request: FindNewsletterV2SubmissionListRequest,
    metadata?: Metadata
  ): Observable<FindNewsletterV2SubmissionListResponse>;
  findNewsletterV2List(
    request: FindNewsletterV2ListRequest,
    metadata?: Metadata
  ): Observable<FindNewsletterV2ListResponse>;
}
