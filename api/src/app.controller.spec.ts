import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('getStatus', () => {
    it('should return status object with "ok"', () => {
      const result = controller.getStatus();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'IMS API');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
