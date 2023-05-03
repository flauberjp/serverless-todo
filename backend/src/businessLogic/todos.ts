import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate'
import * as AWS from 'aws-sdk'

const logger = createLogger('TodosAccess')

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export async function todoItemExist(
  userId: string,
  todoId: string
): Promise<boolean> {
  return await todosAccess.todoItemExist(userId, todoId)
}

export async function todoItemBelongsToUser(
  todoId: string,
  userId: string
): Promise<boolean> {
  return await todosAccess.todoItemBelongsToUser(todoId, userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
) {
  const todoId = uuid.v4()
  return await todosAccess.createTodoItem({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: ''
  })
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
) {
  const todoUpdate: TodoUpdate = {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }
  return await todosAccess.updateTodoItem(userId, todoId, todoUpdate)
}

export async function updateTodoImgUrl(
  userId: string,
  todoId: string,
  attachmentUrl: string
) {
  return await todosAccess.updateTodoImgUrl(userId, todoId, attachmentUrl)
}

export async function deleteTodo(userId: string, todoId: string) {
  return await todosAccess.deleteTodoItem(userId, todoId)
}

export async function createAttachmentPresignedUrl(
  imageName: string
): Promise<string> {
  logger.debug('function: createAttachmentPresignedUrl')
  return attachmentUtils.getUploadUrl(imageName)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodosForUser(userId)
}
