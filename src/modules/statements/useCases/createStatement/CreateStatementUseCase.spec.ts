import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { Statement } from '../../entities/Statement';
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { createTracing } from "trace_events";
import { rejects } from "node:assert";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository);

  });

  it("should be able to make a deposit to an user ", async () => {
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
      amount: 50000,
      description: 'Deposit Test',
      user_id: user.id,
    });

    //criando statement
    const createdStatement = await createStatementUseCase.execute(statement);

    //verificando
    expect(createdStatement).toHaveProperty('id');
    expect(createdStatement.amount).toBeGreaterThan(0);
    expect(createdStatement).toHaveProperty('amount');
  });

  it("should be able to make a withdraw to an user ", async () => {
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
      amount: 50000,
      description: 'Deposit Test',
      user_id: user.id,
    });

    //criando statement
    const createdStatement = await createStatementUseCase.execute(statement);


    Object.assign(statement, {
      type: OperationType.WITHDRAW,
      amount: 25000,
      description: 'withdraw Test',
      user_id: user.id,
    });
    //retirando dinheiro
    const withdrawStatement = await createStatementUseCase.execute(statement);


    //verificando
    expect(withdrawStatement).toHaveProperty('id');
    expect(withdrawStatement.amount).toBe(25000);
    expect(createdStatement).toHaveProperty('amount');
  });

  it("Should not be possible to crate a statement to a non existent user", async () => {
    await expect(createStatementUseCase.execute({
      user_id: '878879',
      type: OperationType.WITHDRAW,
      amount: 100.00,
      description: 'Test withdrawal ',
    })).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to make a withdraw if balance < amount", async () => {
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
      amount: 50.00,
      description: 'Deposit Test',
      user_id: user.id,
    });

    //criando statement
    const createdStatement = await createStatementUseCase.execute(statement);


    Object.assign(statement, {
      type: OperationType.WITHDRAW,
      amount: 75.00,
      description: 'withdraw Test',
      user_id: user.id,
    });

    //retirando dinheiro e vericando erros
    await expect(createStatementUseCase.execute(statement))
      .rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);;

  });


});
