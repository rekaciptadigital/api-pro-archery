export class UserSearchCriteria {
  constructor(
    public readonly search?: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly sort?: string,
    public readonly order: 'asc' | 'desc' = 'asc'
  ) {}

  static create(params: {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): UserSearchCriteria {
    return new UserSearchCriteria(
      params.search,
      params.page || 1,
      params.limit || 10,
      params.sort,
      params.order || 'asc'
    );
  }
}