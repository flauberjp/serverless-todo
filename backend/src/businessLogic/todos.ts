import { TodosAccess } from '../dataLayer/todosAcess'
// import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate'

const todosAccess = new TodosAccess()

export async function getAllTodosItem(): Promise<TodoItem[]> {
  return todosAccess.getAllTodosItem()
}

export async function getTodoItem(todoId: string): Promise<TodoItem> {
  return todosAccess.getTodoItem(todoId)
}

export async function todoItemExist(todoId: string): Promise<boolean> {
  return await todosAccess.todoItemExist(todoId)
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
  const itemId = uuid.v4()
  return await todosAccess.createTodoItem({
    userId: userId,
    id: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: ''
  })
}

export async function updateTodo(
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
) {
  const todoUpdate: TodoUpdate = {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }
  return await todosAccess.updateTodoItem(todoId, todoUpdate)
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
