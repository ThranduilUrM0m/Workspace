import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private connection: Connection) {
    // Enable MongoDB query explain logging in development
    if (process.env.NODE_ENV !== 'production') {
      connection.set('debug', true);
    }

    // Set MongoDB options for better performance
    connection.set('maxTimeMS', 5000); // 5s timeout
    connection.set('bufferCommands', false);
    
    // Index optimization
    this.createIndexes();
  }

  private async createIndexes() {
    // Example index creation - adjust based on your schema
    const collections = await this.connection.db.collections();
    for (const collection of collections) {
      // Create compound indexes for frequently queried fields
      await collection.createIndex({ createdAt: -1 });
      // Add other indexes based on your query patterns
    }
  }

  // Helper method for optimized bulk operations
  async bulkWrite(model: string, operations: any[]) {
    const Model = this.connection.model(model);
    return await Model.bulkWrite(operations, {
      ordered: false, // Allow parallel processing
    });
  }
}
