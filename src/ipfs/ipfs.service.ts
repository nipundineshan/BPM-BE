import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pinataSDK = require('@pinata/sdk');

interface PinataResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pinata: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('PINATA_API_KEY');
    const secretKey = this.configService.get<string>('PINATA_SECRET_API_KEY');
    
    if (apiKey && secretKey) {
      this.pinata = new pinataSDK(apiKey, secretKey);
    } else {
      this.logger.warn('Pinata API keys missing. IPFS uploads will fail.');
    }
  }

  async uploadJson(metadata: Record<string, unknown>): Promise<string> {
    try {
      const result = (await this.pinata.pinJSONToIPFS(metadata)) as PinataResult;
      return result.IpfsHash;
    } catch (error) {
      this.logger.error('Error uploading JSON to IPFS', error);
      throw error;
    }
  }

  async uploadFile(filePath: string, name: string): Promise<string> {
    try {
      const readableStreamForFile = fs.createReadStream(filePath);
      const options = {
        pinataMetadata: {
          name: name,
        },
      };
      const result = (await this.pinata.pinFileToIPFS(readableStreamForFile, options)) as PinataResult;
      return result.IpfsHash;
    } catch (error) {
      this.logger.error('Error uploading file to IPFS', error);
      throw error;
    }
  }
}
