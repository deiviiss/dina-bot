import { createFlow } from '@builderbot/bot'
import { mainFlow } from './welcomeFlow'
import { flowDiary } from './diary/diary.flow'
import { flowFinances } from './finances/finances.flow'
import { confirmRegistration, flowCaptureMissingField, flowHandleMissingFields, flowRegisterExpense, showConfirmation } from './finances/register.flow'
import { flowQueryExpense } from './finances/query.flow'
import { flowQueryDiary } from './diary/query.flow'
import { flowRegisterDiary } from './diary/register.flow'

export default createFlow([
  mainFlow,
  flowFinances,
  flowDiary,
  flowRegisterExpense,
  flowQueryExpense,
  flowRegisterDiary,
  flowQueryDiary,
  confirmRegistration,
  showConfirmation,
  flowCaptureMissingField,
  flowHandleMissingFields
])