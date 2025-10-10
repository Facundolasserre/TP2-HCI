import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from "typeorm";
import { IsOptional, Length } from "class-validator";
import { User } from "./user";
import { Product } from "./product";

@Entity()
@Unique(['name', 'owner'])
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  @Length(1, 50)
  name: string;

  @Column({ type: "simple-json", nullable: true })
  @IsOptional()
  metadata: Record<string, any>;

  @ManyToOne(() => User, user => user.categories)
  owner: User;

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  @IsOptional()
  deletedAt: Date;

  getFormattedCategory(): any {
     return {
       id: this.id,
       name: this.name,
       metadata: this.metadata ?? null,
       createdAt: this.createdAt.toISOString().substring(0, 19).replace('T', ' '),
       updatedAt: this.updatedAt.toISOString().substring(0, 19).replace('T', ' '),
     }
   }
}
