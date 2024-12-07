export class UserSearchCriteria {
  constructor(
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly email?: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly sort: string = 'created_at',
    public readonly order: 'ASC' | 'DESC' = 'DESC'
  ) {}

  static create(params: {
    firstName?: string;
    lastName?: string;
    email?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
  }): UserSearchCriteria {
    return new UserSearchCriteria(
      params.firstName,
      params.lastName,
      params.email,
      params.page || 1,
      params.limit || 10,
      params.sort || 'created_at',
      params.order || 'DESC'
    );
  }
}