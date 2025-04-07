import { addKeyword, EVENTS } from "@builderbot/bot"
import { BotContext, BotMethods, BotState } from "@builderbot/bot/dist/types"
import { getAIResponse } from "~/services/ai-services"
import { flowRegisterExpense } from "./register.flow"
import { flowQueryExpense } from "./query.flow"

const FINANCE_PROMPT = `
    Como experto en análisis de intenciones financieras, clasifica la última interacción del usuario en una de las siguientes categorías:

REGISTER: Si el usuario expresa intención de registrar un gasto o ingreso.

QUERY: Si el usuario quiere consultar información sobre su cuenta.

NO_CLASIFICABLE: Si el mensaje no tiene suficiente información para determinar la intención.

Contexto relevante del historial (últimos 3 mensajes):
{HISTORY}

Criterios para REGISTER (registrar un ingreso o gasto):

Verbos clave: "gasté", "compré", "añadir", "registrar", "ingresé", "pagué", "deposité", "invertí", "tuve".

Sustantivos clave: "monto", "cantidad", "pesos", "dinero", "ingreso", "gasto", "categoría", "fecha".

Mensajes con números seguidos de palabras relacionadas con dinero (ej. "$200 en comida", "1000 pesos en renta").

Criterios para QUERY (consultar información financiera):

Verbos clave: "mostrar", "consultar", "ver", "cuánto", "comparar", "listar", "gráfico", "sumar".

Sustantivos clave: "total", "resumen", "historial", "mes", "promedio", "balance", "categoría más alta/baja".

Menciones a periodos de tiempo ("en abril", "este mes", "últimos 3 meses").

Reglas para clasificación precisa:

Si el mensaje incluye una cantidad de dinero explícita ($, pesos, euros) y palabras relacionadas con gastos o ingresos → REGISTER.

Si pregunta sobre información histórica, comparaciones o estadísticas → QUERY.

Si el mensaje tiene elementos de ambas categorías, pero incluye una pregunta → QUERY.

Si el mensaje es ambiguo o irrelevante para el contexto financiero → NO_CLASIFICABLE.

Ejemplos de clasificación:

"Compré un café por $50" → REGISTER

"¿Cuánto gasté este mes?" → QUERY

"Necesito agregar un ingreso de 2000 pesos" → REGISTER

"Muéstrame el promedio de mis gastos" → QUERY

"Quiero registrar un gasto y también saber cuánto he gastado en total" → QUERY

"Hola" → NO_CLASIFICABLE

Último mensaje del usuario:
"{USER_MESSAGE}"

Respuesta esperada (solo REGISTER/QUERY/NO_CLASIFICABLE):
  `

export const flowFinances = addKeyword([EVENTS.ACTION])
  .addAction(async (ctx: BotContext, { state, gotoFlow, endFlow, flowDynamic }: BotMethods) => {
    await flowDynamic([{
      body: 'También puedes preguntarme cosas como: _¿En que he gastado más?_',
      delay: 1500
    }])

    await flowDynamic([{
      body: 'Ó escribir algo como: _Compré un coca en 22 pesos_',
      delay: 1500
    }])
  }
  )
  .addAnswer(
    '¿Deseas agregar un gasto, ingreso o consultar tu cuenta?',
    { capture: true },
    async (ctx: BotContext, { gotoFlow, fallBack }: BotMethods) => {
      const financeIntent = await getAIResponse(FINANCE_PROMPT.replace("{HISTORY}", ctx.body))

      if (financeIntent.includes('REGISTER')) return gotoFlow(flowRegisterExpense)
      if (financeIntent.includes('QUERY')) return gotoFlow(flowQueryExpense)

      // If no valid intent is detected, end the flow
      return fallBack('No pude determinar la intención de lo que escribes. Por favor, inténtalo de nuevo especificando qué compraste y cuánto te costó.')
    })
