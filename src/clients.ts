/**
 * 이 파일은 scripts/generate-clients.js에 의해 자동 생성됩니다.
 * 직접 수정하지 마세요. proto 파일 수정 후 npm run generate를 실행하세요.
 *
 * gRPC 클라이언트 인터페이스 (proto 원본 메서드명 유지)
 * NestJS proto-loader keepCase: true 설정과 호환됩니다.
 */
import type { Metadata } from '@grpc/grpc-js';
import type { Observable } from 'rxjs';
import type {
  ChargeCreditRequest,
  ChargeCreditResponse,
  FindNewsletterV2ListRequest,
  FindNewsletterV2ListResponse,
  FindNewsletterV2SubmissionListRequest,
  FindNewsletterV2SubmissionListResponse,
  FindOneByOptionsRequest,
  FindOneByOptionsResponse,
  FindParentListRequest,
  FindParentListResponse,
  FindStudentListRequest,
  FindStudentListResponse,
  FindTeacherListRequest,
  FindTeacherListResponse,
  FindUnifiedUserDetailRequest,
  FindUnifiedUserDetailResponse,
  FindUnifiedUserListRequest,
  FindUnifiedUserListResponse,
  GetCreditChargeListRequest,
  GetCreditChargeListResponse,
  GetCreditHistoryListRequest,
  GetCreditHistoryListResponse,
  ResetPasswordAttemptCountRequest,
  ResetPasswordAttemptCountResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './index';

export interface NewsletterV2GrpcClient {
  findSubmissionEndTime(request: FindNewsletterV2SubmissionListRequest, metadata?: Metadata): Observable<FindNewsletterV2SubmissionListResponse>;
  findNewsletterV2List(request: FindNewsletterV2ListRequest, metadata?: Metadata): Observable<FindNewsletterV2ListResponse>;
}

export interface ParentUserGrpcClient {
  FindParentList(request: FindParentListRequest, metadata?: Metadata): Observable<FindParentListResponse>;
}

export interface SmsManagementGrpcClient {
  ChargeCredit(request: ChargeCreditRequest, metadata?: Metadata): Observable<ChargeCreditResponse>;
  GetCreditChargeList(request: GetCreditChargeListRequest, metadata?: Metadata): Observable<GetCreditChargeListResponse>;
  GetCreditHistoryList(request: GetCreditHistoryListRequest, metadata?: Metadata): Observable<GetCreditHistoryListResponse>;
}

export interface StudentUserGrpcClient {
  FindStudentList(request: FindStudentListRequest, metadata?: Metadata): Observable<FindStudentListResponse>;
}

export interface SuperSchoolUserGrpcClient {
  FindOneByOptions(request: FindOneByOptionsRequest, metadata?: Metadata): Observable<FindOneByOptionsResponse>;
  ResetPassword(request: ResetPasswordRequest, metadata?: Metadata): Observable<ResetPasswordResponse>;
  ResetPasswordAttemptCount(request: ResetPasswordAttemptCountRequest, metadata?: Metadata): Observable<ResetPasswordAttemptCountResponse>;
}

export interface TeacherUserGrpcClient {
  FindTeacherList(request: FindTeacherListRequest, metadata?: Metadata): Observable<FindTeacherListResponse>;
}

export interface UnifiedUserGrpcClient {
  FindUnifiedUserList(request: FindUnifiedUserListRequest, metadata?: Metadata): Observable<FindUnifiedUserListResponse>;
  FindUnifiedUserDetail(request: FindUnifiedUserDetailRequest, metadata?: Metadata): Observable<FindUnifiedUserDetailResponse>;
}
