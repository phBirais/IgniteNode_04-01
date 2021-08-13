import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferStatementError } from "./CreateTransferStatementError"
import { OperationType } from "../../entities/Statement";

interface IRequest {
  sender_id: string,
  receiver_id: string,
  amount: number,
  description: string,
}

@injectable()
class CreateTransferStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({ sender_id, receiver_id, amount, description }: IRequest) {
    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) {
      throw new CreateTransferStatementError.SenderNotFound();
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if (!receiver) {
      throw new CreateTransferStatementError.ReceiverNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id
    })

    if (balance < amount) {
      throw new CreateTransferStatementError.InsufficientFunds();
    }

    //recebendo o valor
    await this.statementsRepository.create({
      user_id: receiver_id,
      sender_id,
      description,
      amount,
      type: OperationType.TRANSFER
    })

    //enviando o valor
    const transferStatement = await this.statementsRepository.create({
      user_id: sender_id,
      sender_id,
      description,
      amount,
      type: OperationType.TRANSFER
    })

    return transferStatement
  }
}

export { CreateTransferStatementUseCase }
