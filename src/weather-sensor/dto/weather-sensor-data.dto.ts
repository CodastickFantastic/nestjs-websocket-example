import { IsEnum, IsNumber, IsString, Max, Min } from "class-validator";

enum TemperatureUnit {
    "C",
    "F"
}
export class CreateSensorDataDTO {
    @IsString({ message: "Provide valid sensor_id (string)" })
    sensor_id: string;
    @IsString({ message: "Provide valid temperatureUnit (C or F)" })
    @IsEnum(TemperatureUnit, { message: "Provide valid temperatureUnit (C or F)" })
    temperatureUnit: string
    @IsNumber({}, { message: "Provide valid temperature (number)" })
    temperature: number
    @IsNumber({}, { message: "Provide valid humidity (number betwen 0 and 100 )" })
    @Min(0, { message: "Humidity cannot be less than 0" })
    @Max(100, { message: "Humidity cannot be more than 100" })
    humidity: number
}