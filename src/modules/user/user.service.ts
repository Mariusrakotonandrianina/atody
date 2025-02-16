import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
    private readonly encryptionKey: string;
    private readonly saltRounds: number;

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private configService: ConfigService,
    ) {
        this.encryptionKey = this.configService.get<string>('ENCRYPTION_KEY', 'default-secret-key');
        
        // Conversion explicite de la valeur de SALT_ROUNDS en nombre
        const saltRoundsValue = this.configService.get<string>('SALT_ROUNDS', '10');
        this.saltRounds = Number(saltRoundsValue);

        // Vérification de la validité du nombre
        if (isNaN(this.saltRounds) || this.saltRounds <= 0) {
            throw new Error('La valeur de SALT_ROUNDS dans la configuration est invalide');
        }
    }

    private encryptAES(password: string): string {
        // Assurez-vous que la clé a une longueur de 32 octets
        let key = Buffer.from(this.encryptionKey, 'utf-8');
        if (key.length < 32) {
            // Complétez la clé avec des zéros ou d'autres caractères si elle est trop courte
            const padding = Buffer.alloc(32 - key.length);
            key = Buffer.concat([key, padding]);
        } else if (key.length > 32) {
            // Si la clé est plus longue, coupez-la à 32 octets
            key = key.slice(0, 32);
        }
    
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
        let encrypted = cipher.update(password, 'utf8', 'hex');
        encrypted += cipher.final('hex');
    
        return iv.toString('hex') + ':' + encrypted;
    }
    
    private decryptAES(encryptedPassword: string): string {
        const parts = encryptedPassword.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];

        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'utf-8'), iv);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
        if (existingUser) {
            throw new ConflictException('Cet email est déjà utilisé.');
        }

        // Création du salt avec le nombre de saltRounds
        const salt = await bcrypt.genSalt(this.saltRounds);
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        // Encryption du mot de passe
        const encryptedPassword = this.encryptAES(hashedPassword);

        const user = this.userRepository.create({
            ...createUserDto,
            password: encryptedPassword,
        });

        return this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }
        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }

        if (updateUserDto.email) {
            const existingUser = await this.userRepository.findOne({ where: { email: updateUserDto.email } });
            if (existingUser && existingUser.id !== id) {
                throw new ConflictException('Cet email est déjà utilisé par un autre utilisateur.');
            }
        }

        if (updateUserDto.password) {
            const salt = await bcrypt.genSalt(this.saltRounds);
            const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);
            updateUserDto.password = this.encryptAES(hashedPassword);
        }

        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }
        await this.userRepository.delete(id);
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) return null;

        const decryptedPassword = this.decryptAES(user.password);

        const isPasswordValid = await bcrypt.compare(password, decryptedPassword);
        return isPasswordValid ? user : null;
    }
    
    async findOneByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }
      
}