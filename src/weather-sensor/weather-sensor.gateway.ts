import { Inject, Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WeatherSensorService } from './weather-sensor.service';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CreateSensorDataDTO } from './dto/weather-sensor-data.dto';
import { WeatherSensorDataValidatorPipe } from './pipes/weather-sensor-data-validatior.pipe';

@WebSocketGateway()
export class WeatherSensorGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly weatherSensorService: WeatherSensorService,
  ) { }

  private readonly logger = new Logger(WebSocketGateway.name);

  @WebSocketServer() server: Server

  afterInit() {
    this.logger.log('Weather Sensor Gateway Initialized');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.server.emit("message",
      {
        "Welcome": "to the socket server.",
        "Example": "JSON",
        "--": "----",
        "weatherDataOjbect": {
          "sensor_id": "1",
          "temperatureUnit": "C",
          "temperature": "10",
          "humidity": "20"
        }

      });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.warn(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage("create sensor data")
  async create(@MessageBody(WeatherSensorDataValidatorPipe) data: any) {
    return this.weatherSensorService.create(data);
  }
}
