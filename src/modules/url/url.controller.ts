import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { Response } from 'express';
import { UrlExistsPipe } from './pipes/url-exists/url-exists.pipe';
import { Url } from '@prisma/client';
import { GetUrlsDto } from './dto/get-urls.dto';
import { AuthGuard } from '../../auth/auth.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('URLs')
@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('url')
  @ApiOperation({
    summary: 'Create a new URL',
  })
  @ApiResponse({
    status: 201,
    description: 'The URL has been successfully created',
  })
  @UseGuards(AuthGuard)
  @ApiSecurity('x-api-key')
  create(@Body() createUrlDto: CreateUrlDto) {
    return this.urlService.create(createUrlDto);
  }

  @Get('url')
  @ApiOperation({
    summary: 'Get all URLs',
  })
  @ApiResponse({ status: 200, description: 'List of URLs' })
  @UseGuards(AuthGuard)
  @ApiSecurity('x-api-key')
  findAll(@Query() queryParams: GetUrlsDto) {
    return this.urlService.findAll(queryParams);
  }

  @Get(':uid')
  @ApiOperation({
    summary: 'Redirect to the original URL',
  })
  @ApiResponse({ status: 302, description: 'Redirect to the original URL' })
  findOne(@Param('uid', UrlExistsPipe) url: Url, @Res() res: Response) {
    return res.redirect(url.redirect);
  }

  @Patch('url/:uid')
  @ApiOperation({
    summary: 'Update a URL',
  })
  @ApiResponse({
    status: 200,
    description: 'The URL has been successfully updated',
  })
  @UseGuards(AuthGuard)
  @ApiSecurity('x-api-key')
  update(
    @Param('uid', UrlExistsPipe) url: Url,
    @Body() updateUrlDto: UpdateUrlDto,
  ) {
    return this.urlService.update(url.id, updateUrlDto);
  }

  @Delete('url/:uid')
  @ApiOperation({
    summary: 'Delete a URL',
  })
  @ApiResponse({
    status: 200,
    description: 'The URL has been successfully deleted',
  })
  @ApiSecurity('x-api-key')
  @UseGuards(AuthGuard)
  remove(@Param('uid', UrlExistsPipe) url: Url) {
    return this.urlService.remove(url.id);
  }
}
