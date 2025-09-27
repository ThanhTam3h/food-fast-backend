import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { DroneTelemetry } from './drone_telemetry.model';
import { Shipment } from './shipment.model';

@Table
export class Drone extends Model<Drone> {
  @Column({ allowNull: false, type: DataType.STRING })
  name: string;

  @Column({ allowNull: true, type: DataType.STRING })
  flytbaseVehicleId: string;

  @Column({ allowNull: false, type: DataType.FLOAT })
  maxRangeKm: number;

  @Column({ allowNull: true, type: DataType.GEOGRAPHY('POINT', 4326) })
  currentLocation: string;

  @Column({ allowNull: true, type: DataType.FLOAT })
  altitude: number;

  @Column({ allowNull: true, type: DataType.FLOAT })
  heading: number;

  @Column({ allowNull: true, type: DataType.FLOAT })
  speed: number;

  @Column({ allowNull: true, type: DataType.FLOAT })
  batteryLevel: number;

  @Column({ allowNull: false, type: DataType.FLOAT })
  maxPayloadKg: number;

  @Column({ allowNull: true, type: DataType.FLOAT })
  currentPayloadKg: number;

  @Column({ allowNull: true, type: DataType.STRING })
  mode: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: 'available',
  })
  status: string;

  @Column({ allowNull: true, type: DataType.DATE })
  lastSignal: Date;

  @HasMany(() => DroneTelemetry)
  telemetries: DroneTelemetry[];

  @HasMany(() => Shipment)
  shipments: Shipment[];
}
