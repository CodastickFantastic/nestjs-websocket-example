import { Test, TestingModule } from '@nestjs/testing';
import { WeatherSensorGateway } from './weather-sensor.gateway';

describe('WeatherSensorGateway', () => {
  let gateway: WeatherSensorGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherSensorGateway],
    }).compile();

    gateway = module.get<WeatherSensorGateway>(WeatherSensorGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
