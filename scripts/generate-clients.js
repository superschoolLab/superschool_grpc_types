#!/usr/bin/env node
/**
 * proto 파일에서 gRPC 클라이언트 인터페이스(clients.ts)를 자동 생성하는 스크립트.
 *
 * proto의 service/rpc 정의를 파싱하여:
 * - {ServiceName} → {ServiceName에서 "Service" 제거}GrpcClient 인터페이스 생성
 * - rpc 메서드명은 proto에 정의된 casing 그대로 유지 (keepCase: true 호환)
 */
const fs = require('fs');
const path = require('path');

const PROTO_DIR = path.join(__dirname, '..', 'proto', 'super-school');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'clients.ts');

/**
 * proto 파일에서 service 블록과 rpc 정의를 파싱
 */
function parseProtoFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const services = [];

  // service 블록 매칭 (중첩 없는 단순 구조)
  const serviceRegex = /service\s+(\w+)\s*\{([^}]+)\}/g;
  let serviceMatch;

  while ((serviceMatch = serviceRegex.exec(content)) !== null) {
    const serviceName = serviceMatch[1];
    const serviceBody = serviceMatch[2];
    const rpcs = [];

    // rpc 정의 매칭 (멀티라인 대응)
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
  // 모든 request/response 타입 수집
  const importTypes = new Set();
  for (const service of allServices) {
    for (const rpc of service.rpcs) {
      importTypes.add(rpc.requestType);
      importTypes.add(rpc.responseType);
    }
  }

  const sortedImports = Array.from(importTypes).sort();

  let output = '';

  // 파일 헤더
  output += '/**\n';
  output += ' * 이 파일은 scripts/generate-clients.js에 의해 자동 생성됩니다.\n';
  output += ' * 직접 수정하지 마세요. proto 파일 수정 후 npm run generate를 실행하세요.\n';
  output += ' *\n';
  output += ' * gRPC 클라이언트 인터페이스 (proto 원본 메서드명 유지)\n';
  output += ' * NestJS proto-loader keepCase: true 설정과 호환됩니다.\n';
  output += ' */\n';

  // import 문
  output += "import type { Metadata } from '@grpc/grpc-js';\n";
  output += "import type { Observable } from 'rxjs';\n";
  output += 'import type {\n';
  for (const typeName of sortedImports) {
    output += `  ${typeName},\n`;
  }
  output += "} from './index';\n";
  output += '\n';

  // 인터페이스 생성
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

// 메인 실행
const protoFiles = fs.readdirSync(PROTO_DIR).filter((f) => f.endsWith('.proto'));
const allServices = [];

for (const file of protoFiles) {
  const filePath = path.join(PROTO_DIR, file);
  const services = parseProtoFile(filePath);
  allServices.push(...services);
}

// 서비스명 알파벳 순 정렬
allServices.sort((a, b) => a.serviceName.localeCompare(b.serviceName));

const output = generateClientsTs(allServices);
fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

console.log(`✓ Generated ${OUTPUT_FILE}`);
console.log(`  Services: ${allServices.map((s) => s.serviceName).join(', ')}`);
console.log(`  Total RPCs: ${allServices.reduce((sum, s) => sum + s.rpcs.length, 0)}`);
