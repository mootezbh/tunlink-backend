import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { UrlService } from '../../url.service';

@Injectable()
export class UrlExistsPipe implements PipeTransform {
  constructor(private readonly urlService: UrlService) {}

  async transform(uid: any) {
    const redirectUrl = await this.urlService.findOne(uid);
    if (!redirectUrl) {
      throw new NotFoundException(`Url with uid ${uid} not found`);
    }
    return redirectUrl;
  }
}
