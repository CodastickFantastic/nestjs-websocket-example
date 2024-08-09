import { Module } from '@nestjs/common';
import { WeatherSensorGateway } from './weather-sensor.gateway';
import { WeatherSensorService } from './weather-sensor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorData, SensorDataSchema } from './schema/sensor-data.shema';

@Module({
  imports: [MongooseModule.forFeature([{ name: SensorData.name, schema: SensorDataSchema }])],
  providers: [WeatherSensorGateway, WeatherSensorService]
})
export class WeatherSensorModule { }
