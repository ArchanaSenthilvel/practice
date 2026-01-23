import { v4 as uuidv4 } from 'uuid'
import { TodosAccess } from '../dataLayer/todosAccess.mjs'
import { AttachmentUtils } from '../fileStorage/attachmentUtils.mjs'
import { createLogger } from '../utils/logger.mjs'
const logger = createLogger('TodosBusinessLogic')
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
export async function getTodosForUser(userId) {
  logger.info('Getting todos for user', { userId })
  return await todosAccess.getAllTodos(userId)
}
export async function createTodo(userId, createTodoRequest) {
  logger.info('Creating todo for user', { userId, todo: createTodoRequest })
  const todoId = uuidv4()
  const createdAt = new Date().toISOString()
  const newTodo = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }
  return await todosAccess.createTodo(newTodo)
}
export async function updateTodo(userId, todoId, updateTodoRequest) {
  logger.info('Updating todo', { userId, todoId, updates: updateTodoRequest })
  return await todosAccess.updateTodo(userId, todoId, updateTodoRequest)
}
export async function deleteTodo(userId, todoId) {
  logger.info('Deleting todo', { userId, todoId })
  return await todosAccess.deleteTodo(userId, todoId)
}
export async function createAttachmentPresignedUrl(userId, todoId) {
  logger.info('Creating attachment URL', { userId, todoId })
  const uploadUrl = attachmentUtils.getUploadUrl(todoId)
  const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
  await todosAccess.updateTodoAttachmentUrl(userId, todoId, attachmentUrl)
  return uploadUrl
}
