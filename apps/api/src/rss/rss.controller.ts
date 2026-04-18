import { Controller, Get, Param, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { RssService } from './rss.service';

@Controller('rss')
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @Get('communiques')
  @Public()
  @Header('Content-Type', 'application/rss+xml; charset=utf-8')
  async globalFeed(@Res() res: Response) {
    const xml = await this.rssService.getGlobalFeed();
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  }

  @Get('institution/:slug')
  @Public()
  @Header('Content-Type', 'application/rss+xml; charset=utf-8')
  async institutionFeed(@Param('slug') slug: string, @Res() res: Response) {
    const xml = await this.rssService.getInstitutionFeed(slug);
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  }

  @Get('thematique/:tag')
  @Public()
  @Header('Content-Type', 'application/rss+xml; charset=utf-8')
  async thematiqueFeed(@Param('tag') tag: string, @Res() res: Response) {
    const xml = await this.rssService.getThematiqueFeed(tag);
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  }
}
