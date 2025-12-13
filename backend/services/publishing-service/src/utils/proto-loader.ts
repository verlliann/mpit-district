import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

export function loadProtoDefinition(protoFile: string): grpc.GrpcObject {
  // In production (Docker), proto files are in /app/proto/
  // In development, they are 4 levels up from dist/utils/
  const PROTO_PATH = process.env.NODE_ENV === 'production'
    ? path.resolve('/app/proto', protoFile)
    : path.resolve(__dirname, '../../../..', protoFile);

  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  return grpc.loadPackageDefinition(packageDefinition);
}


