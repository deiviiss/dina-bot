import { EVENTS, addKeyword } from "@builderbot/bot";
import { ExpenseData } from "~/interfaces/expense.interface";
import { getAIResponse } from "~/services/ai-services";
import { flowFinances } from "./finances.flow";

const EXPENSE_EXTRACTION_PROMPT = `
Analiza el mensaje del usuario y extrae la información necesaria para registrar un gasto o ingreso. Si falta algún dato, identifica qué información falta.

Pasos de análisis:
Type: Determina si es EXPENSE o INCOME según palabras clave:

EXPENSE si usa palabras como: "gasté", "compré", "pagué", "$".

INCOME si usa: "deposité", "ingresé", "cobré", "salario".

Amount: Busca números con formato ($100, 500 pesos, 1,000).

Category: Clasifica en: food, transport, home, leisure, health, other.

Description: Extrae el concepto principal.

Reglas adicionales para datos incompletos:
Si falta el monto, marca "amount": null.

Si falta la categoría, intenta inferirla por la descripción; si no es posible, marca "category": "unknown".
Ignora números de fechas, direcciones o cantidades no relacionadas con dinero.

Si falta la descripción, usa "description": "no description".
Si el mensaje contiene palabras ambiguas (como "me llegó dinero" o "me transfirieron"), asume que es INCOME.
Si solo menciona intención sin detalles (ej. "quiero registrar un gasto"), responde con "status": "INCOMPLETE" y una lista de los datos faltantes en "missingFields".

Ejemplos de salida JSON:

Mensaje completo:
Entrada: "Gasté $150 en comida rápida"
Salida: {"type":"EXPENSE","amount":150,"category":"food","description":"fast food","status":"COMPLETE"}

Falta el monto:
Entrada: "Compré pizza"
Salida: {"type":"EXPENSE","amount": null,"category":"food","description":"pizza","status":"INCOMPLETE","missingFields":["amount"]}

Solo intención sin detalles:
Entrada: "Quiero agregar un ingreso"
Salida: {"type":"INCOME","amount": null,"category":"unknown","description":"no description","status":"INCOMPLETE","missingFields":["amount","category","description"]}

ULTIMO MENSAJE DEL USUARIO:
{data}

IMPORTANTE: Responde SOLO con un objeto JSON válido, sin texto adicional ni formato markdown.

Ejemplo de salida esperada:
{
  "description": "tacos en la calle",
  "amount": 23,
    "category": "food",
      "status": "COMPLETE"
      "type": "EXPENSE"
}`;

const EXPENSE_FORMAT = `
Actúa como un asistente financiero que ayuda a completar un registro de gasto.

A continuación recibirás un objeto JSON que contiene datos del gasto. Tu tarea es revisar y actualizar el objeto con base en la información disponible. Haz lo siguiente:

1. Evalúa si la descripción es válida (útil, breve y relacionada con un gasto).
   - Si es muy larga, redúcela a un máximo de 4 palabras.
2. Intenta inferir la categoría correcta a partir de la descripción. Usa una de las siguientes: 
   food, transport, home, services, health, leisure, education, shopping, subscriptions, salary, other.
3. Si logras inferir una categoría válida, actualiza la propiedad "category" y elimínala del arreglo "missingFields".
4. Si la descripción es válida, actualiza su valor (acortado si es necesario) y elimínala también del arreglo "missingFields".
5. Si después de esto ya no hay campos en "missingFields", cambia el "status" a "COMPLETE". Si aún faltan campos, déjalo como "INCOMPLETE".
6. Devuelve el objeto actualizado como JSON válido, sin ningún texto adicional ni formato markdown.
7.- Si la descripción contiene palabras como "cine", "película", "netflix", clasifica como "entretenimiento".
8.- Si hay duda entre dos categorías, escoge la más comúnmente asociada al consumo (ej: "pizza" => "food").

IMPORTANTE: Responde SOLO con el objeto JSON actualizado.

EJEMPLO DE ENTRADA:
{
  "type": "EXPENSE",
  "amount": 100,
  "category": "unknown",
  "description": "compre una pizza",
  "status": "INCOMPLETE",
  "missingFields": ["category", "description"]
}
`;

export const flowRegisterExpense = addKeyword([EVENTS.ACTION])
  .addAction(async (ctx, { state, flowDynamic, gotoFlow }) => {
    const matches = ctx.body.match(/\$\d+|\d+ pesos?|\d+\b/g);
    if (matches && matches.length > 1) {
      await flowDynamic('Por ahora solo puedo hacer un registro por mensaje.')

      return gotoFlow(flowFinances)
    }

    try {
      const aiResponse = await getAIResponse(EXPENSE_EXTRACTION_PROMPT.replace("{data}", ctx.body))
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim()
      const expenseData: ExpenseData = JSON.parse(cleanResponse)

      await flowDynamic('Claro, dame un momento para procesar tus datos...')

      if (expenseData.status === "INCOMPLETE") {
        await state.update({ currentExpense: expenseData })

        return gotoFlow(flowHandleMissingFields)
      }

      await state.update({ currentExpense: expenseData })

      return gotoFlow(showConfirmation)
    } catch (error) {
      console.error(error);
      await flowDynamic([{ body: "No entendí la información de gastos. Inténtalo de nuevo especificando qué compraste y cuánto te costó." }]);
    }
  });

// Flow for confirmation (buttons)
const buttonConfirm = addKeyword('Sí')
  .addAction({ delay: 1000 }, async (_, { flowDynamic }) => {
    try {
      // My logic to save the expense
      return await flowDynamic('✅ Registro guardado con éxito. Vuelve pronto.')

    } catch (error) {
      console.error(error)
      return await flowDynamic('❌ Ha ocurrido un error al guardar el registro. Por favor, inténtalo de nuevo.')
    }
  })

const buttonCancel = addKeyword('No')
  .addAction(async (_, { flowDynamic }) => {
    return await flowDynamic('❌ No has confirmado el registro. Vuelve pronto.')
  })

// Flow for show confirmation
export const showConfirmation = addKeyword([EVENTS.ACTION])
  .addAction(async (_, { state, flowDynamic, gotoFlow }) => {
    const expenseData = await state.get('currentExpense')

    await flowDynamic([{
      body: `
Se registrará como:

*${expenseData.type === 'EXPENSE' ? 'Gasto' : 'Ingreso'}*
📝 Descripción: *${expenseData.description}*
💰 *$${expenseData.amount}*
🏷️ Categoría: *${expenseData.category}*
  `
    },
    ]
    )

    return gotoFlow(confirmRegistration)
  })

// Flow for confirmation
export const confirmRegistration = addKeyword([EVENTS.ACTION])
  .addAnswer(
    '¿Deseas confirmar?',
    {
      capture: true,
      buttons: [{ body: 'Sí' }, { body: 'No' }],

    }, null,
    [buttonConfirm, buttonCancel]
  )

// Flow for missing fields
export const flowHandleMissingFields = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { state, flowDynamic, gotoFlow }) => {
    const { missingFields, type } = await state.get("currentExpense")

    if (!missingFields) return

    if (missingFields.includes("amount")) {
      await flowDynamic(`💰 ¿De cuánto fue el ${type === "EXPENSE" ? "gasto" : "ingreso"}? (Ej: $500)`)
      return gotoFlow(flowCaptureMissingField)
    }

    if (missingFields.includes("description")) {
      await flowDynamic(`📝 ¿Puedes describir brevemente el ${type === "EXPENSE" ? "gasto" : "ingreso"}? (Ej: ${type === "EXPENSE" ? "despensa, agua, CFE" : "salario, pago de nómina, préstamo"})`)

      return gotoFlow(flowCaptureMissingField)
    }

    if (missingFields.includes("category")) {
      await flowDynamic(`🏷️ ¿Qué categoría corresponde al ${type === "EXPENSE" ? "gasto" : "ingreso"}? (Ej: comida, transporte, hogar, ocio, salud, etc.)`)
      return gotoFlow(flowCaptureMissingField)
    }

    if (missingFields.includes("type")) {
      await flowDynamic([{
        body: "📝 ¿Es un gasto o ingreso?",
        buttons: [{ body: "Expense" }, { body: "Income" }]
      }]);
      return gotoFlow(flowCaptureMissingField)
    }

    return gotoFlow(showConfirmation);  // This flow will handle the confirmation
  })

export const flowCaptureMissingField = addKeyword(EVENTS.ACTION)
  .addAction({ capture: true }, async (ctx, { state, gotoFlow }) => {
    const { missingFields } = await state.get("currentExpense");

    if (!missingFields || !missingFields.length) return;

    const currentExpense = await state.get('currentExpense');
    const updatedExpense = { ...currentExpense };

    if (missingFields.includes("amount") && ctx.body) {
      // Clean the value to capture only numbers
      const amount = parseFloat(ctx.body.replace(/[^0-9.]/g, ""));
      // Assign the cleaned value to the amount field
      updatedExpense.amount = isNaN(amount) ? null : amount;

      // validate amount
      if (updatedExpense.amount === null) {

        return gotoFlow(flowHandleMissingFields);
      }

      // Remove 'amount' from the missingFields array
      updatedExpense.missingFields = updatedExpense.missingFields.filter((field: string) => field !== "amount");

      await state.update({ currentExpense: updatedExpense });

      return gotoFlow(flowHandleMissingFields);
    }

    if (missingFields.includes("description") && ctx.body) {
      updatedExpense.description = ctx.body; // Process the description

      const aiResponse = await getAIResponse(EXPENSE_FORMAT + JSON.stringify(updatedExpense))

      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim()

      const expenseData: ExpenseData = JSON.parse(cleanResponse)

      const { missingFields } = expenseData

      if (missingFields.length != 0) {
        await state.update({ currentExpense: updatedExpense });
        return gotoFlow(flowHandleMissingFields)
      }

      updatedExpense.missingFields = updatedExpense.missingFields.filter((field: string) => field !== "description"); // Remove 'description' from the missingFields array

      await state.update({ currentExpense: expenseData })

      return gotoFlow(showConfirmation)
    }

    if (missingFields.includes("category") && ctx.body) {
      updatedExpense.category = ctx.body.toLowerCase(); // Process the category
      updatedExpense.missingFields = updatedExpense.missingFields.filter((field: string) => field !== "category"); // Remove 'category' from the missingFields array

      await state.update({ currentExpense: updatedExpense });
      return gotoFlow(flowHandleMissingFields);
    }

    if (missingFields.includes("type") && ctx.body) {
      updatedExpense.type = ctx.body.toLowerCase(); // Process the type (expense or income)
      updatedExpense.missingFields = updatedExpense.missingField.filter((field: string) => field !== "type"); // Remove 'type' from the missingFields array

      await state.update({ currentExpense: updatedExpense });
      return gotoFlow(flowHandleMissingFields);
    }

    return gotoFlow(flowHandleMissingFields);
  });
