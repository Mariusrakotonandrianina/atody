import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";
import * as bcrypt from 'bcryptjs'; 

@Entity()
export class Entre {
    @PrimaryGeneratedColumn()
    id: Number;

    @Column()
    product: string;

    @Column()
    type: string;

    @Column()
    quantite: string;
    
}