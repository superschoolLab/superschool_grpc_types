#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROTO_DIR="$ROOT_DIR/proto/super-school"
OUT_DIR="$ROOT_DIR/generated"

# Clean previously generated files
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Generate TypeScript from proto files
# all-protos.proto is only for runtime aggregation, not for code generation
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
  "$PROTO_DIR/user.proto" \
  "$PROTO_DIR/student-user.proto" \
  "$PROTO_DIR/teacher-user.proto" \
  "$PROTO_DIR/parent-user.proto" \
  "$PROTO_DIR/unified-user.proto" \
  "$PROTO_DIR/newsletter-v2.proto"

echo "✓ Generated TypeScript files in $OUT_DIR"
ls -la "$OUT_DIR"
