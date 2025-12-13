import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// In Docker: /app/proto/parser.proto (from dist/clients/ -> ../../proto)
// Locally: from src/clients/ -> ../../../../proto
const PARSER_PROTO_PATH = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../../proto/parser.proto')
  : path.join(__dirname, '../../../../proto/parser.proto');
const PARSER_GRPC_URL = process.env.PARSER_GRPC_URL || 'localhost:50051';

const packageDefinition = protoLoader.loadSync(PARSER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const ParserService = protoDescriptor.parser.ParserService;

export class ParserClient {
  private client: any;

  constructor(url: string = PARSER_GRPC_URL) {
    this.client = new ParserService(
      url,
      grpc.credentials.createInsecure()
    );
  }

  async parseArticle(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.ParseArticle({ url }, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async healthCheck(): Promise<boolean> {
    return new Promise((resolve) => {
      this.client.HealthCheck({}, (error: any, response: any) => {
        if (error) {
          console.error('Parser health check failed:', error.message);
          resolve(false);
        } else {
          resolve(response?.status === 'SERVING');
        }
      });
    });
  }
}

