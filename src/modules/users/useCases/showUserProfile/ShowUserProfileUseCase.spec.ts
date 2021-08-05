import "reflect-metadata";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Authenticate User", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to show an user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "test",
      email: "test@example.com",
      password: '1234',
    });

    const profile = await showUserProfileUseCase.execute(user.id || "")

    expect(profile).toHaveProperty("id");
    //expect(result).toHaveProperty("token");
  });

  it('should not be able to show nonexistent user', async () => {
    await expect(
      showUserProfileUseCase.execute('123213')
    ).rejects.toBeInstanceOf(ShowUserProfileError);
  });

});
