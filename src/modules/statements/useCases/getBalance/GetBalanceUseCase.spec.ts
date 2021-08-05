import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { Statement } from '../../entities/Statement';

let getBalance: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('GetBalance', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getBalance = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository,
    );

  });

  it("should be able to get an users balance", async () => {
    const statement = new Statement();

    //criando usuario
    const user = await inMemoryUsersRepository.create({
      name: "test",
      email: "test@example.com",
      password: '1234',
    });

    //associando um deposito ao objeto
    Object.assign(statement, {
      type: OperationType.DEPOSIT,
      amount: 500.00,
      description: 'Deposit Test',
      user_id: user.id,
    });

    //criando statement
    await inMemoryStatementsRepository.create(statement);

    //pegando balanco da conta
    const balance = await getBalance.execute({ user_id: user.id || "" })

    expect(balance).toHaveProperty('balance');
    expect(balance.statement.length).toBe(1);
    expect(balance).toHaveProperty('statement');
  });

  it('should not be able to get the balance of a non existent user', async () => {
    await expect(getBalance.execute({
      user_id: '129323',
    })).rejects.toBeInstanceOf(GetBalanceError);
  });

});
