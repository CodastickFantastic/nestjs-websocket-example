import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SensorDataDocument = HydratedDocument<SensorData>

@Schema({ timestamps: true })
export class SensorData {
    @Prop({ required: true })
    sensor_id: string

    @Prop({ required: true, enum: ['C', 'F'] })
    temperatureUnit: string

    @Prop({ required: true })
    temperature: number

    @Prop({ required: true, min: 0, max: 100 })
    humidity: number

    @Prop({ default: Date.now })
    createdAt: Date
}

export const SensorDataSchema = SchemaFactory.createForClass(SensorData)