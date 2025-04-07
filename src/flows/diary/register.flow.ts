import { EVENTS, addKeyword } from "@builderbot/bot";
import { getAIResponse } from "~/services/ai-services";
import { saveDiaryEntry } from "~/services/diary-service";

export const flowRegisterDiary = addKeyword([EVENTS.ACTION])
  .addAction(async (ctx, { state, flowDynamic, endFlow }) => {
    // Extract the information from the diary using AI
    const DIARY_EXTRACTION_PROMPT = `
      Analiza el siguiente mensaje y extrae la información para una entrada de diario:
      
      Mensaje: "${ctx.body}"
      
      Extrae:
      1. Contenido: el texto principal de la entrada
      2. Estado de ánimo: feliz, triste, enojado, cansado, contento, etc.
      3. Etiquetas: palabras clave separadas por comas (máximo 3)
      
      Responde en formato JSON exactamente así:
      {
        "contenido": "texto principal",
        "estadoAnimo": "feliz",
        "etiquetas": ["tag1", "tag2", "tag3"]
      }
    `;

    try {
      const diaryData = await getAIResponse(DIARY_EXTRACTION_PROMPT);
      const diaryJSON = JSON.parse(diaryData);

      // Save the diary entry
      const userId = await state.get('userId') || 'user123';
      await saveDiaryEntry({
        userId,
        content: diaryJSON.contenido,
        mood: diaryJSON.estadoAnimo,
        tags: diaryJSON.etiquetas,
        date: new Date()
      });

      // Confirm to the user
      await flowDynamic([
        {
          body: `📝 *New entry in your diary:*

${diaryJSON.contenido}

😊 Estado de ánimo: *${diaryJSON.estadoAnimo}*
🏷️ Etiquetas: ${diaryJSON.etiquetas.map(tag => `*${tag}*`).join(', ')}

¿Quieres escribir algo más en tu diario?`
        }
      ]);

      return endFlow();
    } catch (error) {
      await flowDynamic([
        {
          body: "Lo siento, no pude entender tu entrada. Por favor, intenta de nuevo escribiendo lo que quieres registrar en tu diario."
        }
      ]);
      return endFlow();
    }
  }); 