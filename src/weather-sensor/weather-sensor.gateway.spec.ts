import { Test, TestingModule } from "@nestjs/testing";
import { WeatherSensorGateway } from "./weather-sensor.gateway";
import { WeatherSensorService } from "./weather-sensor.service";
import { INestApplication } from "@nestjs/common";
import { io } from "socket.io-client";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Connection } from "mongoose";
import { MongooseModule } from "@nestjs/mongoose";
import { SensorData, SensorDataSchema } from "./schema/sensor-data.shema";
import { CreateSensorDataDTO } from "./dto/weather-sensor-data.dto";
import { rejects } from "assert";

describe("WeatherSensorGateway", () => {
  let app: INestApplication;
  let module: TestingModule;
  let dummyMongo: MongoMemoryServer;
  let mongoConn: Connection;

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

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(dummyMongo.getUri()),
        MongooseModule.forFeature([{ name: SensorData.name, schema: SensorDataSchema }]),
      ],
      providers: [WeatherSensorService, WeatherSensorGateway],
    }).compile();

    app = module.createNestApplication();
    await app.listen(8000);
  });

  afterEach(async () => {
    await mongoConn.dropDatabase();
    await app.close();
  });

  // Testing welcome message
  it("should emit a welcome message on connection", async () => {
    const ws = io("ws://localhost:8000");

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Timeout: WebSocket did not receive a message"));
        ws.close();
      }, 5000);

      ws.on("connect", () => {
        ws.on("welcome", (data) => {
          try {
            expect(data).toEqual({
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

            clearTimeout(timer);
            ws.close();
            resolve();
          } catch (error) {
            clearTimeout(timer);
            ws.close();
            reject(error);
          }
        });
      });
    });
  });

  // Testing create function
  it("should call WeatherSensorService.create and respond with created sensor data", async () => {
    const ws = io("ws://localhost:8000");

    await new Promise<void>((resolve, reject) => {

      const inputData = {
        sensor_id: "sensor-10",
        temperatureUnit: "C",
        temperature: 10,
        humidity: 20
      }

      // Emit the event with data to be saved
      ws.emit("create sensor data", inputData);

      // Listen for the response from the WebSocket server
      ws.on("message", async (response) => {
        try {
          // Assertions
          expect(response).toHaveProperty('_id');
          expect(response.sensor_id).toBe(inputData.sensor_id);
          expect(response.temperatureUnit).toBe(inputData.temperatureUnit);
          expect(response.temperature).toBe(inputData.temperature);
          expect(response.humidity).toBe(inputData.humidity);
          expect(response).toHaveProperty('createdAt');
          expect(new Date(response.createdAt)).toBeInstanceOf(Date);

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });
    });
  });

  // Testing create function with bad input
  it("should sned erorr when input data is not JSON", async () => {
    const ws = io("ws://localhost:8000");

    await new Promise<void>((resolve, reject) => {
      // Emit the event with data to be saved
      ws.emit("create sensor data", "Not a JSON");

      // Listen for the response from the WebSocket server
      ws.on("exception", async (response) => {
        try {
          expect(response).toEqual({
            "status": "error",
            "message": "Input must be a JSON object"
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });
    });
  });

  it("should send erorr when no sensor_id", async () => {
    const ws = io("ws://localhost:8000");

    const invalidInputData = {
      temperatureUnit: "C",
      temperature: 10,
      humidity: 20
    }

    await new Promise<void>((resolve, reject) => {
      // Emit the event with data to be saved
      ws.emit("create sensor data", invalidInputData);

      // Listen for the response from the WebSocket server
      ws.on("exception", async (response) => {
        try {
          expect(response).toEqual({
            "status": "error",
            "message": "Validation failed",
            "errors": {
              "sensor_id": [
                "Provide valid sensor_id (string)"
              ]
            }
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });
    });
  });

  it("should send erorr when no temperatureUnit", async () => {
    const ws = io("ws://localhost:8000");

    const invalidInputData = {
      sensor_id: "sensor-10",
      temperature: 10,
      humidity: 20
    }

    await new Promise<void>((resolve, reject) => {
      // Emit the event with data to be saved
      ws.emit("create sensor data", invalidInputData);

      // Listen for the response from the WebSocket server
      ws.on("exception", async (response) => {
        try {
          expect(response).toEqual({
            "status": "error",
            "message": "Validation failed",
            "errors": {
              "temperatureUnit": [
                "Provide valid temperatureUnit (C or F)",
                "Provide valid temperatureUnit (C or F)"
              ]
            }
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });
    });
  });

  it("should send erorr when wrong temperatureUnit", async () => {
    const ws = io("ws://localhost:8000");

    const invalidInputData = {
      sensor_id: "sensor-10",
      temperatureUnit: "Wrong Unit",
      temperature: 10,
      humidity: 20
    }

    await new Promise<void>((resolve, reject) => {
      // Emit the event with data to be saved
      ws.emit("create sensor data", invalidInputData);

      // Listen for the response from the WebSocket server
      ws.on("exception", async (response) => {
        try {
          expect(response).toEqual({
            "status": "error",
            "message": "Validation failed",
            "errors": {
              "temperatureUnit": [
                "Provide valid temperatureUnit (C or F)"
              ]
            }
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });
    });
  });

  it("should send erorr when no temperature", async () => {
    const ws = io("ws://localhost:8000");

    const invalidInputData = {
      sensor_id: "sensor-10",
      temperatureUnit: "C",
      humidity: 20
    }

    await new Promise<void>((resolve, reject) => {
      // Emit the event with data to be saved
      ws.emit("create sensor data", invalidInputData);

      // Listen for the response from the WebSocket server
      ws.on("exception", async (response) => {
        try {
          expect(response).toEqual({
            "status": "error",
            "message": "Validation failed",
            "errors": {
              "temperature": [
                "Provide valid temperature (number)"
              ]
            }
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });
    });
  });

  it("should send erorr when no humidity", async () => {
    const ws = io("ws://localhost:8000");

    const invalidInputData = {
      sensor_id: "sensor-10",
      temperatureUnit: "C",
      temperature: 10
    }

    await new Promise<void>((resolve, reject) => {
      // Emit the event with data to be saved
      ws.emit("create sensor data", invalidInputData);

      // Listen for the response from the WebSocket server
      ws.on("exception", async (response) => {
        try {
          expect(response).toEqual({
            "status": "error",
            "message": "Validation failed",
            "errors": {
              "humidity": [
                "Humidity cannot be more than 100",
                "Humidity cannot be less than 0",
                "Provide valid humidity (number betwen 0 and 100 )"
              ]
            }
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });
    });
  });

  it("should send erorr when humidity under 0", async () => {
    const ws = io("ws://localhost:8000");

    const invalidInputData = {
      sensor_id: "sensor-10",
      temperatureUnit: "C",
      temperature: 10,
      humidity: -10
    }

    await new Promise<void>((resolve, reject) => {
      // Emit the event with data to be saved
      ws.emit("create sensor data", invalidInputData);

      // Listen for the response from the WebSocket server
      ws.on("exception", async (response) => {
        try {
          expect(response).toEqual({
            "status": "error",
            "message": "Validation failed",
            "errors": {
              "humidity": [
                "Humidity cannot be less than 0"
              ]
            }
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });
    });
  });

  it("should send erorr when humidity over 100", async () => {
    const ws = io("ws://localhost:8000");

    const invalidInputData = {
      sensor_id: "sensor-10",
      temperatureUnit: "C",
      temperature: 10,
      humidity: 101
    }

    await new Promise<void>((resolve, reject) => {
      // Emit the event with data to be saved
      ws.emit("create sensor data", invalidInputData);

      // Listen for the response from the WebSocket server
      ws.on("exception", async (response) => {
        try {
          expect(response).toEqual({
            "status": "error",
            "message": "Validation failed",
            "errors": {
              "humidity": [
                "Humidity cannot be more than 100"
              ]
            }
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });
    });
  });

  it("should create 2 sensor data and return them", async () => {
    // Insert some test data into the database
    const testSensorData1: CreateSensorDataDTO = {
      sensor_id: "sensor-1",
      temperatureUnit: "C",
      temperature: 22,
      humidity: 55,
    };

    const testSensorData2: CreateSensorDataDTO = {
      sensor_id: "sensor-2",
      temperatureUnit: "F",
      temperature: 70,
      humidity: 45,
    };

    // Connect to Socket
    const ws = io("ws://localhost:8000");

    // Create 1st record
    await new Promise<void>((resolve, rejects) => {
      ws.once("message", (response) => {
        resolve(response);
      });

      ws.emit("create sensor data", testSensorData1);
    });

    // Create 2nd record
    await new Promise<void>((resolve, rejects) => {
      ws.once("message", (response) => {
        resolve(response);
      });

      ws.emit("create sensor data", testSensorData2);
    });

    // Look for all data
    await new Promise<void>((resolve, reject) => {
      ws.emit("show all sensor data");

      ws.on("message", (response) => {
        try {
          expect(response).toBeInstanceOf(Array);
          expect(response.length).toBe(2);

          const [sensor1, sensor2] = response;

          expect(sensor1).toMatchObject({
            sensor_id: "sensor-1",
            temperatureUnit: "C",
            temperature: 22,
            humidity: 55,
          });

          expect(sensor2).toMatchObject({
            sensor_id: "sensor-2",
            temperatureUnit: "F",
            temperature: 70,
            humidity: 45,
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });
    });
  });
});
