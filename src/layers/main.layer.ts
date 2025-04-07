import { BotState, BotContext, BotMethods } from "@builderbot/bot/dist/types"
import { getHistoryParse } from "../utils/handleHistory"
import { getAIResponse } from "~/services/ai-services"
import { flowFinances } from "~/flows/finances/finances.flow"
import { flowDiary } from "~/flows/diary/diary.flow"
// import { addAnswer } from "@builderbot/bot"

const PROMPT_INITIAL_CONVERSATION = `
Eres un clasificador de intenciones para un chatbot personal. Analiza el último mensaje del usuario y clasifícalo en una de estas categorías:

--------------------------------------------------------
Mensaje del usuario:
{HISTORY}

CATEGORÍAS:

1. FINANZAS
   Clasifica como FINANZAS si el mensaje:
   - Menciona explícitamente dinero, compras, pagos, ingresos, gastos
   - Incluye precios o cantidades monetarias
   - Se refiere a transacciones económicas de cualquier tipo

   Ejemplos:
   - "Compré pan por $30"
   - "Pagué mi renta"
   - "Compre 10 de tortilla"
   - "Me pagaron hoy"
   - "Gasté demasiado en el cine"

2. DIARIO
   Clasifica como DIARIO si el mensaje:
   - Cuenta una anécdota o experiencia personal
   - Describe situaciones graciosas, tristes o interesantes que vivió
   - Menciona interacciones con otras personas (amigos, familia, etc.)
   - Habla sobre lo que ocurrió durante su día
   - Expresa cualquier tipo de emoción o reacción personal
   - Menciona recuerdos o momentos específicos
   - Describe conversaciones o cosas que alguien dijo

   Ejemplos:
   - "Hoy vi a María en el parque"
   - "Fue gracioso cuando mi hijo dijo algo inesperado"
   - "No puedo creer lo que pasó en el trabajo"
   - "Mi amigo me contó un chiste buenísimo"
   - "La reunión de hoy fue un desastre"

3. NO_CLASIFICABLE
   Usa esta categoría solo si el mensaje no encaja claramente en ninguna de las anteriores

--------------------------------------------------------

INSTRUCCIONES IMPORTANTES:
- Si el mensaje habla de una experiencia, anécdota o momento de la vida del usuario, clasifícalo como DIARIO
- Si menciona cosas que alguien dijo o conversaciones que tuvo, es DIARIO
- Cualquier narración de sucesos personales debe clasificarse como DIARIO
- Solo clasifica como FINANZAS si hay mención explícita de dinero o transacciones económicas

Tu objetivo es comprender la intención del usuario y seleccionar la acción más adecuada en respuesta a su declaración.

**Respuesta ideal (FINANZAS|DIARIO|NO_CLASIFICABLE)**:
`

// This layer is used to determine Finances or Diary
export default async (_: BotContext, { state, gotoFlow, endFlow, flowDynamic }: BotMethods) => {
  const history = getHistoryParse(state as BotState)
  const intentPrediction = await getAIResponse(PROMPT_INITIAL_CONVERSATION.replace("{HISTORY}", history));

  if (intentPrediction.includes('FINANZAS')) return gotoFlow(flowFinances);
  if (intentPrediction.includes('DIARIO')) return gotoFlow(flowDiary);

  return flowDynamic([{ body: 'No entiendo lo que quieres decirme, escribe el gasto, ingreso o cuentamé tu dia' }])
}
