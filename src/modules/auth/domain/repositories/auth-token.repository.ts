import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, DeepPartial } from "typeorm";
import { AuthToken } from "../entities/auth-token.entity";
import { BaseRepository } from "../../../../common/repositories/base.repository";

@Injectable()
export class AuthTokenRepository extends BaseRepository<AuthToken> {
  constructor(
    @InjectRepository(AuthToken)
    private readonly authTokenRepository: Repository<AuthToken>
  ) {
    super(authTokenRepository);
  }

  async findByRefreshToken(refreshToken: string): Promise<AuthToken | null> {
    return this.authTokenRepository.findOne({
      where: {
        refresh_token: refreshToken,
      },
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.authTokenRepository.delete({
      expires_at: new Date(),
    });
  }

  async deleteUserTokens(userId: number): Promise<void> {
    await this.authTokenRepository.delete({
      user_id: userId,
    });
  }

  async findAndCount(options?: any): Promise<[AuthToken[], number]> {
    return this.authTokenRepository.findAndCount(options);
  }

  createQueryBuilder(alias: string) {
    return this.authTokenRepository.createQueryBuilder(alias);
  }

  override async findById(id: string | number): Promise<AuthToken | null> {
    return this.authTokenRepository.findOne({
      where: { id: id.toString() },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.authTokenRepository.delete({ id });
  }

  override async update(
    id: string | number,
    data: DeepPartial<AuthToken>
  ): Promise<AuthToken> {
    await this.authTokenRepository.update(id.toString(), data);
    const updated = await this.findById(id.toString());
    if (!updated) {
      throw new Error("Entity not found after update");
    }
    return updated;
  }
}
