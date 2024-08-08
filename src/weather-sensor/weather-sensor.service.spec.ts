import { Test, TestingModule } from '@nestjs/testing';
import { WeatherSensorService } from './weather-sensor.service';

describe('WeatherSensorService', () => {
  let service: WeatherSensorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherSensorService],
    }).compile();

    service = module.get<WeatherSensorService>(WeatherSensorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
