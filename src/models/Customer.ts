import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Orders } from "./Order";

export interface CustomerAttributes {
  customerId: string;
  customerName: string;
  tier: string;
  totalSpent: number;
  lastTierUpdate: Date;
}

@Table({
  tableName: "customers",
  freezeTableName: true,
  timestamps: false,
})
export class Customers extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: "id",
  })
  customerId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: "name",
  })
  customerName!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: "Bronze",
  })
  tier!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: "total_spent",
  })
  totalSpent!: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: "last_tier_update",
  })
  lastTierUpdate!: Date;

  @HasMany(() => Orders)
  orders!: Orders[];
}
