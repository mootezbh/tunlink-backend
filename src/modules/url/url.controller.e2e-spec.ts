import * as request from 'supertest';
import { server, app } from '../../../test/setup';
import { createManyUrls } from './__tests__/test-utils';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';

describe(`UrlController (e2e)`, () => {
  let configService: ConfigService;
  let databaseService: DatabaseService;
  let apiKey: string;
  let host: string;

  beforeAll(async () => {
    configService = app.get(ConfigService);
    databaseService = app.get(DatabaseService);
    apiKey = configService.getOrThrow(`apiKey`);
    host = configService.getOrThrow(`host`);
  });
  describe(`POST /url`, () => {
    it(`should create a URL`, () => {
      return request(server)
        .post(`/url`)
        .send({ title: 'Google', redirect: 'https://google.com' })
        .set('x-api-key', apiKey)
        .expect(201)
        .expect((res) => {
          const { data } = res.body;
          expect(data.title).toEqual('Google');
          expect(data.redirect).toEqual('https://google.com');
          expect(data.description).toBeNull();
        });
    });
    it(`should create a URL with a description`, () => {
      return request(server)
        .post(`/url`)
        .set('x-api-key', apiKey)
        .send({
          title: 'Google',
          redirect: 'https://google.com',
          description: 'A search engine',
        })
        .expect(201)
        .expect((res) => {
          const { data } = res.body;
          expect(data.title).toEqual('Google');
          expect(data.redirect).toEqual('https://google.com');
          expect(data.description).toEqual('A search engine');
        });
    });
    it(`should return a 400 if title and/or redirect are missing`, () => {
      return request(server)
        .post(`/url`)
        .send({
          description: 'A search engine',
        })
        .set('x-api-key', apiKey)
        .expect(400);
    });
    it(`should return a 401 if api key is missing`, () => {
      return request(server)
        .post(`/url`)
        .send({
          description: 'A search engine',
        })
        .expect(401);
    });
  });

  describe(`GET /url`, () => {
    it(`should return an empty list when no URLs exist`, async () => {
      await request(server)
        .get(`/url`)
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toEqual([]);
          expect(res.body.meta).toEqual({
            totalCount: 0,
            currentPage: 1,
            pageSize: 10,
            totalPages: 0,
            nextPage: null,
            prevPage: null,
          });
        });
    });

    it(`should return a list of URLs when they exist`, async () => {
      // Pre-create URLs in the database
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });

      await request(server)
        .get(`/url`)
        .expect(200)
        .set('x-api-key', apiKey)
        .expect((res) => {
          expect(res.body.data).toHaveLength(3); // Assuming 3 URLs were pre-created
          res.body.data.forEach((url: any) => {
            expect(url).toHaveProperty('id');
            expect(url).toHaveProperty('title');
            expect(url).toHaveProperty('redirect');
          });
          expect(res.body.meta).toEqual({
            totalCount: 3,
            currentPage: 1,
            pageSize: 10,
            totalPages: 1,
            nextPage: null,
            prevPage: null,
          });
        });
    });
    it(`should return a filtered list of URLs when they exist`, async () => {
      // Pre-create URLs in the database
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });

      await request(server)
        .get(`/url?filter=Google`)
        .expect(200)
        .set('x-api-key', apiKey)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1); // Assuming 3 URLs were pre-created
          res.body.data.forEach((url: any) => {
            expect(url).toHaveProperty('id');
            expect(url).toHaveProperty('title');
            expect(url).toHaveProperty('redirect');
          });
          expect(res.body.meta).toEqual({
            totalCount: 3,
            currentPage: 1,
            pageSize: 10,
            totalPages: 1,
            nextPage: null,
            prevPage: null,
          });
        });
    });
    it(`using limit query parameter should impact pagination`, async () => {
      // Pre-create URLs in the database
      const mockedUrlsPayload = createManyUrls({ host });
      await databaseService.url.createMany({
        data: mockedUrlsPayload,
      });

      await request(server)
        .get(`/url?limit=2`)
        .expect(200)
        .set('x-api-key', apiKey)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          res.body.data.forEach((url: any) => {
            expect(url).toHaveProperty('id');
            expect(url).toHaveProperty('title');
            expect(url).toHaveProperty('redirect');
          });
          expect(res.body.meta).toEqual({
            totalCount: 3,
            currentPage: 1,
            pageSize: 2,
            totalPages: 2,
            nextPage: `${host}/url?limit=2&page=2`,
            prevPage: null,
          });
        });
    });
  });

  describe(`PATCH /url/:uid`, () => {
    it(`should update the URL if it exists`, async () => {
      await databaseService.url.create({
        data: {
          title: 'Google',
          redirect: 'https://google.com',
          url: `${host}/random-uid`,
        },
      });

      await request(server)
        .patch(`/url/random-uid`)
        .send({ title: 'Updated Title' })
        .set('x-api-key', apiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.title).toEqual('Updated Title');
        });
    });

    it(`should return a 404 if the URL does not exist`, async () => {
      await request(server)
        .patch(`/url/non-existing-uid`)
        .set('x-api-key', apiKey)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe(`DELETE /url/:uid`, () => {
    it(`should delete the URL if it exists`, async () => {
      await databaseService.url.create({
        data: {
          title: 'Google',
          redirect: 'https://google.com',
          url: `${host}/random-uid`,
        },
      });

      await request(server)
        .delete(`/url/random-uid`)
        .set('x-api-key', apiKey)
        .expect(200);
    });

    it(`should return a 404 if the URL does not exist`, async () => {
      await request(server)
        .delete(`/url/non-existing-uid`)
        .set('x-api-key', apiKey)
        .expect(404);
    });
  });

  describe(`GET /:uid (URL Redirection)`, () => {
    it(`should redirect to the original URL`, async () => {
      await databaseService.url.create({
        data: {
          title: 'Google',
          redirect: 'https://google.com',
          url: `${host}/random-uid`,
        },
      });

      const response = await request(server)
        .get(`/random-uid`)
        .redirects(0) // Prevents supertest from following the redirect
        .expect(302); // 302 Found is the HTTP status code for redirection

      expect(response.headers.location).toBe('https://google.com');
    });

    it(`should return a 404 if the short URL does not exist`, async () => {
      await request(server).get(`/non-existing-uid`).expect(404);
    });
  });
});
