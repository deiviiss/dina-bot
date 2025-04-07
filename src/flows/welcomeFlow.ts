import { addKeyword, EVENTS } from '@builderbot/bot'
import conversationalLayer from '~/layers/conversational.layer'
import { flowFinances } from './finances/finances.flow'

const userNumberDiary = process.env.USER_NUMBER_DIARY

const mainFlow = addKeyword(EVENTS.WELCOME)
  .addAction(async (ctx, { state, flowDynamic }) => {
    await state.update({ userName: ctx.name })

    const userName = await state.get('userName')

    await flowDynamic([{ body: 'Bienvenido ' + userName }])
  })
  .addAnswer(
    '¿En que te puedo ayudar?',
    {
      delay: 1000,
      capture: true,
      buttons: [
        { body: 'Finanzas 📊' },
        { body: 'Consultar AI 🔍' },
        { body: 'Diario 📖' },
      ]
    },
    async (ctx, { flowDynamic, gotoFlow, fallBack }) => {
      const userChoice = ctx.body

      if (userChoice === 'Finanzas 📊') {
        return gotoFlow(flowFinances)
      }

      if (userChoice === 'Consultar AI 🔍') {
        return await flowDynamic([{ body: '🔎 ¿Qué necesitas saber?' },])
      }

      if (userChoice === 'Diario 📖') {
        const isUserDiary = await ctx.from === userNumberDiary

        if (!isUserDiary) {
          return await flowDynamic([{ body: 'Lo siento, no puedes acceder al diario de este usuario.' },])
        }

        return await flowDynamic([{ body: '📖 Cuéntame, ¿cómo va tu día?' },])
      }

      return fallBack('❌ No entendí lo que me pediste. Por favor, elige una de las opciones.')
    }
  )
  .addAction(conversationalLayer)

export { mainFlow }