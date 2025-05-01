import { Injectable } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UidService } from '../../services/uid/uid.service';
import { DatabaseService } from '../../database/database.service';
import { ConfigService } from '@nestjs/config';
import { GetUrlsDto } from './dto/get-urls.dto';

@Injectable()
export class UrlService {
  private host: string;
  constructor(
    private readonly uidService: UidService,
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.host = this.configService.getOrThrow<string>('host');
  }
  create(createUrlDto: CreateUrlDto) {
    const randomId = this.uidService.generate(10);
    const url = this.databaseService.url.create({
      data: {
        ...createUrlDto,
        url: `${this.host}/${randomId}`,
      },
    });
    return url;
  }

  async findAll({ filter, page = 1, limit = 10 }: GetUrlsDto) {
    const whereClause = filter
      ? {
          OR: [
            { title: { contains: filter } },
            { redirect: { contains: filter } },
            { description: { contains: filter } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;
    const data = await this.databaseService.url.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
    });
    const totalCount = await this.databaseService.url.count();
    let baseUrl = `${this.host}/url?limit=${limit}`;
    if (filter) {
      baseUrl += `&filter=${encodeURIComponent(filter)}`;
    }
    const totalPages = Math.ceil(totalCount / limit);
    const nextPage = page < totalPages ? `${baseUrl}&page=${page + 1}` : null;
    const prevPage = page > 1 ? `${baseUrl}&page=${page - 1}` : null;
    const meta = {
      totalCount,
      currentPage: page,
      pageSize: limit,
      totalPages,
      nextPage,
      prevPage,
    };
    return {
      data,
      meta,
    };
  }

  async findOne(uid: string) {
    return await this.databaseService.url.findUnique({
      where: {
        url: `${this.host}/${uid}`,
      },
    });
  }

  async update(id: number, updateUrlDto: UpdateUrlDto) {
    return await this.databaseService.url.update({
      where: { id },
      data: updateUrlDto,
    });
  }

  async remove(id: number) {
    return await this.databaseService.url.delete({ where: { id } });
  }
}
