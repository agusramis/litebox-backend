import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RelatedPostsRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async findMany(limit: number) {
    return this.relatedPost.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { title: string; imageKey: string; topic: string; author: string; readTime: number }) {
    return this.relatedPost.create({
      data,
    });
  }

  async findById(id: number) {
    return this.relatedPost.findUnique({
      where: { id },
    });
  }
}
