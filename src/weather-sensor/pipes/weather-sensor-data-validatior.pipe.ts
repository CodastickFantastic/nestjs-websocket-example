import { Injectable, PipeTransform } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { plainToInstance } from "class-transformer";
import { validateOrReject, ValidationError } from "class-validator";
import { CreateSensorDataDTO } from "src/weather-sensor/dto/weather-sensor-data.dto";
@Injectable()
export class WeatherSensorDataValidatorPipe implements PipeTransform {
    async transform(data: any) {
        try {
            const json = JSON.parse(data);
            const createMessageDTO = plainToInstance(CreateSensorDataDTO, json);
            await validateOrReject(createMessageDTO, { whitelist: true, forbidNonWhitelisted: true, })
            return json;
        } catch (errors) {
            if (Array.isArray(errors) && errors[0] instanceof ValidationError) {
                // Create a validation error object
                const validationErrors = this.formatErrors(errors);

                throw new WsException({
                    status: 'error',
                    message: 'Validation failed',
                    errors: validationErrors,
                });
            } else {
                throw new WsException('An unexpected error occurred');
            }
        }
    }

    // Format validation errors
    private formatErrors(errors: ValidationError[]): Record<string, string[]> {
        const result: Record<string, string[]> = {};
        errors.forEach(error => {
            const constraints = error.constraints;
            if (constraints) {
                result[error.property] = Object.values(constraints);
            }
        });
        return result;
    }
}