import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Customers } from "./Customer";

@Table({
  tableName: "orders",
  freezeTableName: true,
  timestamps: false,
})
export class Orders extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: "order_id",
  })
  orderId!: string;

  @ForeignKey(() => Customers)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "customer_id",
  })
  customerId!: number;

  @BelongsTo(() => Customers)
  customer!: Customers;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "total_in_cents",
  })
  totalInCents!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date!: Date;
}
