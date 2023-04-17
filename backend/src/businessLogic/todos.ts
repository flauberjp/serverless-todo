import { TodosAccess } from '../dataLayer/todosAcess'
// import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const todosAccess = new TodosAccess()

export async function getAllTodosItem(): Promise<TodoItem[]> {
  return todosAccess.getAllTodosItem()
}
export async function createGroup(
  createTodoRequest: CreateTodoRequest,
  JwtToken: string
): Promise<TodoItem> {
  const itemId = uuid.v4()
  console.log('JwtToken', JwtToken)
  //const userId = getUserId(JwtToken)
  const userId = ''

  return await todosAccess.createTodoItem({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: ''
  })
}

export async function createTodo() {
  // TODO implement
}

export async function deleteTodo() {
  // TODO implement
}

export async function createAttachmentPresignedUrl() {
  // TODO implement
}

export async function getTodosForUser() {
  // TODO implement
}

export async function updateTodo() {
  // TODO implement
}
