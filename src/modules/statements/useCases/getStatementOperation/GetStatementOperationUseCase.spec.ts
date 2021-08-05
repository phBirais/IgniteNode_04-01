import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { Statement } from '../../entities/Statement';
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Statement Operation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )

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
    const statementOp = await getStatementOperationUseCase.execute({
      user_id: user.id || "",
      statement_id: statement.id || "",
    });

    expect(statementOp).toHaveProperty('id');
    expect(statementOp).toMatchObject(statement);
  });

  it('should not be possible to get the statement of a nonexistent user', async () => {
    await expect(getStatementOperationUseCase.execute({
      user_id: '123',
      statement_id: '213',
    })).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a user's nonexistent statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "test",
      email: "test@example.com",
      password: '1234',
    });

    await expect(getStatementOperationUseCase.execute({
      user_id: user.id || "",
      statement_id: '1234',
    })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });



});
