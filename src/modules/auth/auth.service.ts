import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { User } from "../user/entities/user.entity";

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}

    async validateGoogleUser(profile: any): Promise<User> {
        let user = await this.userService.findOneByEmail(profile.email[0].value);

        if (!user) {
            user = await this.userService.create({
                email: profile.email[0].value,
                name: profile.displayName,
                password: '',
                googleId: profile.id
            });
        }

        return user;
    }
}
