import { Injectable, PipeTransform } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { CreateSensorDataDTO } from '../dto/weather-sensor-data.dto';

@Injectable()
export class WeatherSensorDataValidatorPipe implements PipeTransform {
    async transform(data: any) {
        try {
            if (typeof data !== 'object') throw new Error('Input must be a JSON object');
            const createWeatherDataDto = plainToInstance(CreateSensorDataDTO, data);
            await validateOrReject(createWeatherDataDto, {
                whitelist: true,
                forbidNonWhitelisted: true,
            });
            return data;
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
                throw new WsException(errors.message);
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
