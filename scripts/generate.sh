#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROTO_DIR="$ROOT_DIR/proto/super-school"
OUT_DIR="$ROOT_DIR/generated"

# Clean previously generated files
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# proto 파일 자동 수집 (proto/super-school/*.proto)
PROTO_FILES=("$PROTO_DIR"/*.proto)

# Generate TypeScript from proto files
protoc \
  --plugin="$ROOT_DIR/node_modules/.bin/protoc-gen-ts_proto" \
  --ts_proto_out="$OUT_DIR" \
  --ts_proto_opt=nestJs=true \
  --ts_proto_opt=outputServices=grpc-js \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=useOptionals=messages \
  --ts_proto_opt=addGrpcMetadata=true \
  --ts_proto_opt=exportCommonSymbols=false \
  -I "$PROTO_DIR" \
  "${PROTO_FILES[@]}"

echo "✓ Generated TypeScript files in $OUT_DIR"
ls -la "$OUT_DIR"

# Generate clients.ts + src/index.ts + proto/all-protos.proto from proto definitions
node "$SCRIPT_DIR/generate-clients.js"
