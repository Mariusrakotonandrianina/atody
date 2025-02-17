import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: Number;

    @Column()
    email: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column({ type: 'varchar', nullable: true })
    googleId: string | null;
    
}