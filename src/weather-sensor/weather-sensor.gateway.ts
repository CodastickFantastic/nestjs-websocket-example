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
    const { sockets } = this.server.sockets;

    this.logger.warn(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);

    // Send message to client on connection
    this.server.emit("message", "Connected to socket");
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.warn(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage("create sensor data")
  async create(@MessageBody(WeatherSensorDataValidatorPipe) data: any, @ConnectedSocket() client: Socket): Promise<void> {
    // Log connection
    this.logger.log(`Client ${client.id} sent weather data to create`);


    this.server.to(client.id).emit("message", data);
  }
}
