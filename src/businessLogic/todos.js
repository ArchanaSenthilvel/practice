import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
import * as uuid from 'uuid'

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return todosAccess.getAllTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  
  return await todosAccess.createTodo({
    todoId,
    userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  })
}

export async function updateTodo(
  todoId: string,
  userId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> {
  return todosAccess.updateTodo(todoId, userId, updateTodoRequest as TodoUpdate)
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<void> {
  return todosAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
): Promise<string> {
  const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
  await todosAccess.updateAttachmentUrl(todoId, userId, attachmentUrl)
  
  return attachmentUtils.getUploadUrl(todoId)
}