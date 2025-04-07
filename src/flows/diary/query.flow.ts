import { EVENTS, addKeyword } from "@builderbot/bot";
import { getAIResponse } from "~/services/ai-services";
import { getDiaryEntries, getDiarySummary } from "../../services/diary-service";

// Extract the information from the query using AI
const QUERY_EXTRACTION_PROMPT = `
      Analiza la siguiente consulta sobre el diario personal:
      
      Consulta: "ctx.body"
      
      Extrae:
      1. Período: HOY, SEMANA, MES, o TODO
      2. Etiquetas: palabras clave para filtrar (opcional)
      
      Responde en formato JSON exactamente así:
      {
        "periodo": "HOY",
        "etiquetas": ["tag1", "tag2"]
      }
    `;

export const flowQueryDiary = addKeyword([EVENTS.ACTION])
  .addAction(async (ctx, { state, flowDynamic, endFlow }) => {

    try {
      const queryData = await getAIResponse(QUERY_EXTRACTION_PROMPT.replace("ctx.body", ctx.body));
      const queryJSON = JSON.parse(queryData);

      // Calculate dates based on the period
      const endDate = new Date();
      const startDate = new Date();

      // switch (queryJSON.periodo) {
      //   case 'HOY':
      //     startDate.setHours(0, 0, 0, 0);
      //     break;
      //   case 'SEMANA':
      //     startDate.setDate(endDate.getDate() - 7);
      //     break;
      //   case 'MES':
      //     startDate.setMonth(endDate.getMonth() - 1);
      //     break;
      //   case 'TODO':
      //     startDate.setFullYear(2000); // Far date to get all
      //     break;
      // }

      // Get entries and summary
      // const userId = await state.get('userId') || 'user123';
      // const entries = await getDiaryEntries(userId, startDate, endDate, queryJSON.etiquetas);
      // const summary = await getDiarySummary(userId, startDate, endDate);

      // Format response
      //       let response = `📊 *Summary of your diary:*

      // 📝 Total de entradas: *${summary.totalEntries}*

      // 😊 *Estados de ánimo:*
      // ${Object.entries(summary.moodDistribution)
      //           .map(([mood, count]) => `- ${mood}: ${count} entradas`)
      //           .join('\n')}

      // 🏷️ *Etiquetas más usadas:*
      // ${summary.topTags
      //           .map(tag => `- ${tag.name}: ${tag.count} veces`)
      //           .join('\n')}

      // 📖 *Últimas entradas:*
      // `;

      // Add the last 3 entries
      //       entries.slice(0, 3).forEach(entry => {
      //         response += `
      // 📅 ${entry.date.toLocaleDateString()}
      // ${entry.content}
      // 😊 ${entry.mood}
      // 🏷️ ${entry.tags.join(', ')}
      // `;
      //       });

      // await flowDynamic([{ body: response }]);
      await flowDynamic([{ body: 'Estoy en la consulta de diario' }]);
      return endFlow();
    } catch (error) {
      await flowDynamic([
        {
          body: "Lo siento, no pude procesar tu consulta. Por favor, intenta de nuevo especificando qué información quieres ver de tu diario."
        }
      ]);
      return endFlow();
    }
  }); 