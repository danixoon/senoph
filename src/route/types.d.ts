declare type ItemsResponse<T> = {
  items: T[];
};

declare namespace ApiResponse {
  declare type Phone = Database.Phone;
  declare type FetchPhones = ItemsResponse<Database.Phone>;

  declare type Model = Database.Model;
  declare type FetchModels = ItemsResponse<Database.Model>;
}
