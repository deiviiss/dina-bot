import { EVENTS, addKeyword } from "@builderbot/bot";
import { getAIResponse } from "~/services/ai-services";
import { getExpenseSummary } from "~/services/expense-service";
import { getExpenses } from "~/services/expense-service";

interface Timeframe {
  start: Date;
  end: Date;
}

export const flowQueryExpense = addKeyword([EVENTS.ACTION])
  .addAction(async (ctx, { state, flowDynamic, endFlow }) => {
    // Determine what type of financial query the user wants to perform
    const QUERY_INTENT_PROMPT = `
      Determina qué tipo de consulta financiera quiere realizar el usuario:
      
      Mensaje: "${ctx.body}"
      
      Tipos de consulta:
      1. RESUMEN_DIA: Resumen de gastos/ingresos del día
      2. RESUMEN_SEMANA: Resumen de la semana
      3. RESUMEN_MES: Resumen del mes
      4. CATEGORIA: Gastos por categoría específica
      5. BALANCE: Balance general (ingresos vs gastos)
      
      Responde únicamente con: RESUMEN_DIA, RESUMEN_SEMANA, RESUMEN_MES, CATEGORIA o BALANCE
    `;

    try {
      const queryType = await getAIResponse(QUERY_INTENT_PROMPT);
      const userId = await state.get('userId');
      let responseText = "";

      // Extraer categoría si es necesario
      let category = null;
      if (queryType.includes('CATEGORIA')) {
        const CATEGORY_PROMPT = `
          Extrae la categoría de gasto mencionada en el mensaje:
          
          Mensaje: "${ctx.body}"
          
          Posibles categorías: comida, transporte, hogar, ocio, salud, etc.
          Responde solo con el nombre de la categoría.
        `;
        category = await getAIResponse(CATEGORY_PROMPT);
      }

      // Obtener datos según tipo de consulta
      let timeframe: Timeframe;
      const now = new Date();

      if (queryType.includes('RESUMEN_DIA')) {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        timeframe = { start: startOfDay, end: now };
      } else if (queryType.includes('RESUMEN_SEMANA')) {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        timeframe = { start: startOfWeek, end: now };
      } else if (queryType.includes('RESUMEN_MES')) {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        timeframe = { start: startOfMonth, end: now };
      } else {
        // For BALANCE or CATEGORY, use the current month by default
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        timeframe = { start: startOfMonth, end: now };
      }

      if (queryType.includes('CATEGORIA') && category) {
        const expenses = await getExpenses(userId, timeframe.start, timeframe.end, category);

        if (expenses.length === 0) {
          responseText = `No encontré gastos en la categoría *${category}* en el período consultado.`;
        } else {
          const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
          responseText = `📊 *Gastos en ${category}*\n\n`;

          expenses.forEach(expense => {
            responseText += `• ${expense.description}: $${expense.amount} (${new Date(expense.date).toLocaleDateString()})\n`;
          });

          responseText += `\n💰 *Total: $${total}*`;
        }
      } else {
        // For summaries and balance
        const summary = await getExpenseSummary(userId, timeframe.start, timeframe.end);

        if (queryType.includes('BALANCE')) {
          responseText = `📊 *Balance General*\n\n`;
          responseText += `💵 Ingresos: $${summary.totalIncome}\n`;
          responseText += `💸 Gastos: $${summary.totalExpense}\n`;
          responseText += `\n⚖️ *Balance: $${summary.totalIncome - summary.totalExpense}*`;

          // Add basic recommendation
          if (summary.totalIncome > summary.totalExpense) {
            responseText += `\n\n✅ Vas bien, has gastado menos de lo que has ingresado.`;
          } else {
            responseText += `\n\n⚠️ Tus gastos superan tus ingresos. Considera revisar tu presupuesto.`;
          }
        } else {
          // For summaries
          const periodText = queryType.includes('RESUMEN_DIA') ? 'hoy' :
            queryType.includes('RESUMEN_SEMANA') ? 'esta semana' : 'este mes';

          responseText = `📊 *Resumen de ${periodText}*\n\n`;
          responseText += `💵 Ingresos: $${summary.totalIncome}\n`;
          responseText += `💸 Gastos: $${summary.totalExpense}\n\n`;

          // Top 3 categories of expenses
          responseText += `*Top categorías de gastos:*\n`;
          summary.topCategories.forEach((cat, index) => {
            responseText += `${index + 1}. ${cat.name}: $${cat.amount}\n`;
          });
        }
      }

      await flowDynamic([{ body: responseText }]);
      return endFlow();

    } catch (error) {
      await flowDynamic([
        {
          body: "Lo siento, tuve un problema al procesar tu consulta. Por favor, intenta de nuevo con una pregunta más específica sobre tus finanzas."
        }
      ]);
      return endFlow();
    }
  }); 