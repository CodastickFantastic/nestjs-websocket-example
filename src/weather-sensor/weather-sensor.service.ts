import { Injectable } from '@nestjs/common';
import { CreateSensorDataDTO } from './dto/weather-sensor-data.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SensorData } from './schema/sensor-data.shema';
import { Model } from 'mongoose';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WeatherSensorService {
    constructor(@InjectModel(SensorData.name) private model: Model<SensorData>) { }


    async create(data: CreateSensorDataDTO) {
        try {
            let { sensor_id, temperatureUnit, temperature, humidity } = data

            const newSensorData = new this.model({
                sensor_id,
                temperatureUnit,
                temperature,
                humidity
            })

            let sensorData = await newSensorData.save()
            return { event: "message", data: sensorData };

        } catch (error) {
            throw new WsException(`DB Create Error:${error.message}`);
        }
    }
}
