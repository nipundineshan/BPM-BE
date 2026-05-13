import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, ContractTransactionResponse, ContractTransactionReceipt } from 'ethers';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  private readonly abi = [
    "function mintPlot(address buyer, string memory tokenURI) public returns (uint256)",
    "function tokenCounter() public view returns (uint256)",
    "function tokenURI(uint256 tokenId) public view returns (string)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
  ];

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const rpcUrl = this.configService.get<string>('SEPOLIA_RPC_URL');
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const contractAddress = "0x8E5364096036b4226780e6bD77c5f65585a42bF1";

    if (!rpcUrl || !privateKey || !contractAddress) {
      this.logger.warn('Blockchain configuration missing. Service will not be fully functional.');
      return;
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(contractAddress, this.abi, this.wallet);
    
    this.logger.log(`Blockchain service initialized for existing contract at ${contractAddress}`);
  }

  async mintProperty(to: string, uri: string): Promise<ContractTransactionReceipt | null> {
    const tx = await this.contract.getFunction('mintPlot')(to, uri) as ContractTransactionResponse;
    return await tx.wait();
  }

  async getTokenCounter(): Promise<bigint> {
    return await this.contract.getFunction('tokenCounter')();
  }

  getContract(): ethers.Contract {
    return this.contract;
  }
}
