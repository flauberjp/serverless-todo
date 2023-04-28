import { TodosAccess } from '../dataLayer/todosAcess'
// import { AttachmentUtils } from '../helpers/attachmentUtils'
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
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpirationInSeconds = parseInt(process.env.SIGNED_URL_EXPIRATION)

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

export async function deleteTodo(userId: string, todoId: string) {
  return await todosAccess.deleteTodoItem(userId, todoId)
}

export function createAttachmentPresignedUrl(imageName: string): string {
  logger.debug('function: createAttachmentPresignedUrl')
  return getUploadUrl(imageName)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodosForUser(userId)
}

function getUploadUrl(key: string) {
  const param = {
    Bucket: bucketName,
    Key: key,
    Expires: 60 * urlExpirationInSeconds
  }

  const url = s3.getSignedUrl('putObject', param)

  return url
}
