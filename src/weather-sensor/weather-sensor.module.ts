import { Module } from '@nestjs/common';
import { WeatherSensorGateway } from './weather-sensor.gateway';
import { WeatherSensorService } from './weather-sensor.service';

@Module({
  providers: [WeatherSensorGateway, WeatherSensorService]
})
export class WeatherSensorModule { }
