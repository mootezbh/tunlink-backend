import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { UrlExistsPipe } from './url-exists.pipe';
import { UrlService } from '../../url.service';
import { NotFoundException } from '@nestjs/common';
import { Url } from '@prisma/client';

describe('UrlExistsPipe', () => {
  let pipe: UrlExistsPipe;
  let urlService: DeepMocked<UrlService>;

  beforeEach(() => {
    urlService = createMock<UrlService>();
    pipe = new UrlExistsPipe(urlService);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return url if it exists', async () => {
    let url: Url = {
      id: 1,
      title: 'Test Title',
      url: 'localhost:3000/test',
      redirect: 'http://example.com/',
      description: 'Test Description',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    urlService.findOne.mockResolvedValueOnce(url);
    const result = await pipe.transform('test');
    expect(result).toEqual(url);
  });

  it('should throw NotFoundException if url does not exist', async () => {
    urlService.findOne.mockResolvedValue(null);
    const result = () => pipe.transform('nonexistent');
    expect(result).rejects.toThrow(NotFoundException);
  });
});
