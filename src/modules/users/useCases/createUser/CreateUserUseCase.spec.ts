import "reflect-metadata";

import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create an user", async () => {
    const user = await createUserUseCase.execute({
      name: "Test",
      email: "test@example.com",
      password: "1234",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be possible to create user with existent email", () => {
    expect(async () => {
      const data = {
        name: "Test",
        email: "test@example.com",
        password: "123456",
      };
      await inMemoryUsersRepository.create(data);

      await createUserUseCase.execute(data);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
