import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("api_endpoints")
export class ApiEndpoint extends BaseEntity {
  @Column()
  path: string;

  @Column()
  method: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ default: false })
  is_public: boolean;
}