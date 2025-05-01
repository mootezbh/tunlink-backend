import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { UidService } from '../../../src/services/uid/uid.service';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../../src/database/database.service';

describe('UrlService', () => {
  let urlService: UrlService;
  let uidService: DeepMocked<UidService>;
  let configService: DeepMocked<ConfigService>;
  let databaseService: DeepMockProxy<DatabaseService>;
  let host = 'localhost:3000';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: UidService,
          useValue: createMock<UidService>(),
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>(),
        },
        {
          provide: DatabaseService,
          useValue: mockDeep<DatabaseService>(),
        },
      ],
    }).compile();
    const app = module.createNestApplication();

    urlService = module.get<UrlService>(UrlService);
    uidService = module.get(UidService);
    configService = module.get(ConfigService);
    configService.getOrThrow.mockReturnValue(host);
    databaseService = module.get(DatabaseService);

    await app.init();
  });

  it('should be defined', () => {
    expect(urlService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new URL', async () => {
      const createUrlDto = {
        title: 'Test Title',
        redirect: 'http://example.com/',
        description: 'Test Description',
      };
      const uid = 'test';
      const mockedUrl = {
        ...createUrlDto,
        id: 1,
        url: `${host}/${uid}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      uidService.generate.mockReturnValue(uid);
      databaseService.url.create.mockResolvedValueOnce(mockedUrl);
      const result = await urlService.create(createUrlDto);
      expect(result).toEqual(mockedUrl);
    });
  });

  describe('findAll', () => {
    it('should return an array of URLs', async () => {
      const urls = [
        {
          id: 1,
          title: 'Test Title',
          url: 'localhost:3000/test',
          redirect: 'http://example.com/',
          description: 'Test Description',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Test Title',
          url: 'localhost:3000/test',
          redirect: 'http://example.com/',
          description: 'Test Description',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      databaseService.url.findMany.mockResolvedValueOnce(urls);
      const result = await urlService.findAll({
        filter: '',
        page: 1,
        limit: 10,
      });
      expect(result).toEqual({
        data: urls,
        meta: {
          totalCount: undefined,
          currentPage: 1,
          pageSize: 10,
          totalPages: NaN,
          prevPage: null,
          nextPage: null,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a URL', async () => {
      const url = {
        id: 1,
        title: 'Test Title',
        url: 'localhost:3000/test',
        redirect: 'http://example.com/',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      databaseService.url.findUnique.mockResolvedValueOnce(url);
      const result = await urlService.findOne('test');
      expect(result).toEqual(url);
    });
  });

  describe('remove', () => {
    it('should remove a URL', async () => {
      const url = {
        id: 1,
        title: 'Test Title',
        url: 'localhost:3000/test',
        redirect: 'http://example.com/',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      databaseService.url.delete.mockResolvedValueOnce(url);
      const result = await urlService.remove(1);
      expect(result).toEqual(url);
    });
  });
  describe('update', () => {
    it('should update a URL', async () => {
      const updateUrlDto = {
        title: 'Updated Title',
        redirect: 'http://example.com/updated',
        description: 'Updated Description',
      };
      const url = {
        id: 1,
        title: 'Test Title',
        url: 'localhost:3000/test',
        redirect: 'http://example.com/',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      databaseService.url.update.mockResolvedValueOnce(url);
      const result = await urlService.update(1, updateUrlDto);
      expect(result).toEqual(url);
    });
  });
});
