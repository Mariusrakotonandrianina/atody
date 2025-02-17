import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { Repository } from "typeorm";
import { MatierePremiere } from "./entities/matierePremiere.entity";
import { ConfigService } from "@nestjs/config";