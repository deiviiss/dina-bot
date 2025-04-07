import { addKeyword } from '@builderbot/bot'
import { getAIResponse } from '~/services/ai-services'
import { flowRegisterDiary } from './register.flow'
import { flowQueryDiary } from './query.flow'

const DIARY_PROMPT = `
Analiza el siguiente mensaje y determina si el usuario está intentando REGISTER una entrada en su diario o QUERY entradas anteriores.

Mensaje del usuario: {MESSAGE}

Ejemplos de REGISTER:
- "Hoy me sentí triste"
- "Tuve un buen día"
- "Me fue mal en el trabajo"
- "Estoy muy feliz"

Ejemplos de QUERY:
- "Cómo me sentí ayer?"
- "Ver mi diario"
- "Mis notas de la semana"
- "Entradas anteriores"

Responde únicamente con: REGISTER o QUERY
`

export const flowDiary = addKeyword(['DIARY'])
  .addAction(async (ctx, { gotoFlow }) => {
    const diaryIntent = await getAIResponse(DIARY_PROMPT.replace('{MESSAGE}', ctx.body))
    if (diaryIntent.includes('REGISTER')) return gotoFlow(flowRegisterDiary)
    if (diaryIntent.includes('QUERY')) return gotoFlow(flowQueryDiary)
  }) 