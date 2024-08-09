import { Test, TestingModule } from '@nestjs/testing';
import { WeatherSensorService } from './weather-sensor.service';
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { Connection } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorData, SensorDataSchema } from './schema/sensor-data.shema';
import { WsException } from '@nestjs/websockets';

describe('WeatherSensorService', () => {
  let module: TestingModule
  let service: WeatherSensorService;
  let dummyMongo: MongoMemoryServer
  let mongoConn: Connection

  // Connect to DummyMongoDB before all tests
  beforeAll(async () => {
    dummyMongo = await MongoMemoryServer.create();
    const uri = dummyMongo.getUri();

    mongoConn = (await mongoose.connect(uri)).connection;
  });

  // Disconnect from DummyMongoDB after all tests
  afterAll(async () => {
    await mongoConn.dropDatabase();
    await mongoConn.close();
    await dummyMongo.stop();
  });

  // Connect to DummyMongoDB before each test
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(dummyMongo.getUri()),
        MongooseModule.forFeature([{ name: SensorData.name, schema: SensorDataSchema }]),
      ],
      providers: [WeatherSensorService],
    }).compile();

    service = module.get<WeatherSensorService>(WeatherSensorService);
  });

  // Disconnect from DummyMongoDB after each test and drop Dummy DB
  afterEach(async () => {
    // Drop Dummy DB after each test
    await mongoConn.dropDatabase();
    await module.close();
  });

  // Testing initialization
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(dummyMongo).toBeDefined();
  });

  // Testing create function
  it('should create and return sensor data with createdAt', async () => {
    const inputData = {
      sensor_id: 'sensor-10',
      temperatureUnit: 'C',
      temperature: 10,
      humidity: 20,
    };

    const result = await service.create(inputData);
    const resultObj = result.data;

    // Sprawdzenie czy wynik zawiera timestamp i dane wejściowe
    expect(resultObj).toHaveProperty('_id');
    expect(resultObj.sensor_id).toBe(inputData.sensor_id);
    expect(resultObj.temperatureUnit).toBe(inputData.temperatureUnit);
    expect(resultObj.temperature).toBe(inputData.temperature);
    expect(resultObj.humidity).toBe(inputData.humidity);
    expect(resultObj).toHaveProperty('createdAt');
    expect(resultObj.createdAt).toBeInstanceOf(Date);
  });

  // Testing create function with invalid data
  it('should throw WsException when invalid data is provided', async () => {
    const invalidData = {
      sensor_id: '', // Brak ID sensora
      temperatureUnit: 'C',
      temperature: null, // Temperatura jest null
      humidity: -10, // Wilgotność poniżej zera, co może być nieprawidłowe
    };

    // Oczekujemy, że metoda rzuci WsException
    await expect(service.create(invalidData)).rejects.toThrow(WsException);
  });

  // Testing findAll function
  it('should return all sensor data records', async () => {
    // Przygotowanie przykładowych danych
    const sensorData1 = {
      sensor_id: 'sensor-10',
      temperatureUnit: 'C',
      temperature: 10,
      humidity: 20,
    };

    const sensorData2 = {
      sensor_id: 'sensor-11',
      temperatureUnit: 'F',
      temperature: 50,
      humidity: 30,
    };

    // Dodanie przykładowych danych do bazy
    await service.create(sensorData1);
    await service.create(sensorData2);

    // Wywołanie metody findAll
    const result = await service.findAll();
    const resultObj = result.data;

    // Sprawdzenie, czy zwrócono wszystkie rekordy
    expect(resultObj).toHaveLength(2);

    // Sprawdzenie, czy zwrócone rekordy odpowiadają wprowadzonym danym
    expect(resultObj[0].sensor_id).toBe(sensorData1.sensor_id);
    expect(resultObj[0].temperatureUnit).toBe(sensorData1.temperatureUnit);
    expect(resultObj[0].temperature).toBe(sensorData1.temperature);
    expect(resultObj[0].humidity).toBe(sensorData1.humidity);

    expect(resultObj[1].sensor_id).toBe(sensorData2.sensor_id);
    expect(resultObj[1].temperatureUnit).toBe(sensorData2.temperatureUnit);
    expect(resultObj[1].temperature).toBe(sensorData2.temperature);
    expect(resultObj[1].humidity).toBe(sensorData2.humidity);
  });

  // Test with different temperature units
  it('should handle sensor data with different temperature units', async () => {
    const celsiusData = {
      sensor_id: 'sensor-13',
      temperatureUnit: 'C',
      temperature: 25,
      humidity: 40,
    };

    const fahrenheitData = {
      sensor_id: 'sensor-14',
      temperatureUnit: 'F',
      temperature: 77,
      humidity: 45,
    };

    await service.create(celsiusData);
    await service.create(fahrenheitData);

    const result = await service.findAll();
    const resultObj = result.data;

    // Sprawdzenie, czy dane zostały zapisane poprawnie
    expect(resultObj).toHaveLength(2);
    expect(resultObj[0].temperatureUnit).toBe(celsiusData.temperatureUnit);
    expect(resultObj[1].temperatureUnit).toBe(fahrenheitData.temperatureUnit);
  });

  // Testing findAll function with no records
  it('should return an empty array when no records are found', async () => {
    // W bazie danych nie ma żadnych rekordów
    const result = await service.findAll();
    const resultObj = result.data;

    // Sprawdzenie, czy zwrócono pustą tablicę
    expect(resultObj).toHaveLength(0);
  });
});
