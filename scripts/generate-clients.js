#!/usr/bin/env node
/**
 * proto 파일을 스캔하여 아래 파일들을 자동 생성하는 스크립트.
 *
 * 생성 대상:
 * 1. src/clients.ts — gRPC 클라이언트 인터페이스 (proto 원본 메서드명 유지)
 * 2. src/index.ts — 모든 generated/*.ts re-export + proto 경로 헬퍼
 * 3. proto/all-protos.proto — 서비스 aggregator (런타임 proto-loader용)
 *
 * 이 파일들은 직접 수정하지 마세요. proto 수정 후 npm run generate를 실행하세요.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PROTO_DIR = path.join(ROOT_DIR, 'proto', 'super-school');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const ALL_PROTOS_FILE = path.join(ROOT_DIR, 'proto', 'all-protos.proto');
const CLIENTS_FILE = path.join(SRC_DIR, 'clients.ts');
const INDEX_FILE = path.join(SRC_DIR, 'index.ts');

/**
 * proto 파일에서 service 블록과 rpc 정의를 파싱
 */
function parseProtoFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const services = [];

  const serviceRegex = /service\s+(\w+)\s*\{([^}]+)\}/g;
  let serviceMatch;

  while ((serviceMatch = serviceRegex.exec(content)) !== null) {
    const serviceName = serviceMatch[1];
    const serviceBody = serviceMatch[2];
    const rpcs = [];

    const rpcRegex = /rpc\s+(\w+)\s*\(\s*(\w+)\s*\)\s*returns\s*\(\s*(\w+)\s*\)/g;
    let rpcMatch;

    while ((rpcMatch = rpcRegex.exec(serviceBody)) !== null) {
      rpcs.push({
        methodName: rpcMatch[1],
        requestType: rpcMatch[2],
        responseType: rpcMatch[3],
      });
    }

    services.push({ serviceName, rpcs });
  }

  return services;
}

/**
 * ServiceName → GrpcClient 인터페이스명 변환
 * 예: StudentUserService → StudentUserGrpcClient
 */
function toClientInterfaceName(serviceName) {
  return serviceName.replace(/Service$/, '') + 'GrpcClient';
}

/**
 * clients.ts 파일 내용 생성
 */
function generateClientsTs(allServices) {
  const importTypes = new Set();
  for (const service of allServices) {
    for (const rpc of service.rpcs) {
      importTypes.add(rpc.requestType);
      importTypes.add(rpc.responseType);
    }
  }

  const sortedImports = Array.from(importTypes).sort();

  let output = '';
  output += '/**\n';
  output += ' * 이 파일은 scripts/generate-clients.js에 의해 자동 생성됩니다.\n';
  output += ' * 직접 수정하지 마세요. proto 파일 수정 후 npm run generate를 실행하세요.\n';
  output += ' *\n';
  output += ' * gRPC 클라이언트 인터페이스 (proto 원본 메서드명 유지)\n';
  output += ' * NestJS proto-loader keepCase: true 설정과 호환됩니다.\n';
  output += ' */\n';
  output += "import type { Metadata } from '@grpc/grpc-js';\n";
  output += "import type { Observable } from 'rxjs';\n";
  output += 'import type {\n';
  for (const typeName of sortedImports) {
    output += `  ${typeName},\n`;
  }
  output += "} from './index';\n";
  output += '\n';

  for (const service of allServices) {
    const interfaceName = toClientInterfaceName(service.serviceName);
    output += `export interface ${interfaceName} {\n`;
    for (const rpc of service.rpcs) {
      output += `  ${rpc.methodName}(request: ${rpc.requestType}, metadata?: Metadata): Observable<${rpc.responseType}>;\n`;
    }
    output += '}\n';
    output += '\n';
  }

  return output.trimEnd() + '\n';
}

/**
 * src/index.ts 파일 내용 생성
 * generated/*.ts 전부 re-export + clients.ts + proto 경로 헬퍼
 */
function generateIndexTs(protoBasenames) {
  let output = '';
  output += '// 이 파일은 scripts/generate-clients.js에 의해 자동 생성됩니다.\n';
  output += '// 직접 수정하지 마세요. proto 파일 수정 후 npm run generate를 실행하세요.\n';
  output += '\n';
  output += '// 자동 생성된 메시지 타입 re-export\n';
  for (const base of protoBasenames) {
    output += `export * from '../generated/${base}';\n`;
  }
  output += '\n';
  output += '// 클라이언트 인터페이스 (keepCase: true 환경용)\n';
  output += "export * from './clients';\n";
  output += '\n';
  output += '// proto 경로 헬퍼\n';
  output += "import { join } from 'path';\n";
  output += '\n';
  output += "export const PROTO_DIR = join(__dirname, '..', '..', 'proto');\n";
  output += "export const ALL_PROTOS_PATH = join(PROTO_DIR, 'all-protos.proto');\n";
  output += "export const PROTO_INCLUDE_DIRS = [PROTO_DIR, join(PROTO_DIR, 'super-school')];\n";
  output += "export const SUPER_SCHOOL_PACKAGE = 'super_school';\n";
  return output;
}

/**
 * proto/all-protos.proto 파일 내용 생성
 * 런타임 proto-loader용 aggregator
 */
function generateAllProtosFile(protoBasenames) {
  let output = '';
  output += '// 이 파일은 scripts/generate-clients.js에 의해 자동 생성됩니다.\n';
  output += '// 직접 수정하지 마세요. proto 파일 추가 후 npm run generate를 실행하세요.\n';
  output += '\n';
  output += 'syntax = "proto3";\n';
  output += '\n';
  for (const base of protoBasenames) {
    output += `import "super-school/${base}.proto";\n`;
  }
  return output;
}

// 메인 실행
const protoFiles = fs
  .readdirSync(PROTO_DIR)
  .filter((f) => f.endsWith('.proto'))
  .sort();

const protoBasenames = protoFiles.map((f) => f.replace(/\.proto$/, ''));
const allServices = [];

for (const file of protoFiles) {
  const filePath = path.join(PROTO_DIR, file);
  const services = parseProtoFile(filePath);
  allServices.push(...services);
}

allServices.sort((a, b) => a.serviceName.localeCompare(b.serviceName));

// 1. src/clients.ts 생성
fs.writeFileSync(CLIENTS_FILE, generateClientsTs(allServices), 'utf-8');
console.log(`✓ Generated ${path.relative(ROOT_DIR, CLIENTS_FILE)}`);

// 2. src/index.ts 생성
fs.writeFileSync(INDEX_FILE, generateIndexTs(protoBasenames), 'utf-8');
console.log(`✓ Generated ${path.relative(ROOT_DIR, INDEX_FILE)}`);

// 3. proto/all-protos.proto 생성
fs.writeFileSync(ALL_PROTOS_FILE, generateAllProtosFile(protoBasenames), 'utf-8');
console.log(`✓ Generated ${path.relative(ROOT_DIR, ALL_PROTOS_FILE)}`);

console.log('');
console.log(`  Proto files: ${protoFiles.join(', ')}`);
console.log(`  Services: ${allServices.map((s) => s.serviceName).join(', ')}`);
console.log(`  Total RPCs: ${allServices.reduce((sum, s) => sum + s.rpcs.length, 0)}`);
