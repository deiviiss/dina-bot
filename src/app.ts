import { createBot } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import templates from './flows'
import { metaProvider } from './provider'

const PORT = process.env.PORT ?? 3008

const main = async () => {
  const { handleCtx, httpServer } = await createBot({
    flow: templates,
    provider: metaProvider,
    database: new Database(),
  })

  httpServer(+PORT)
}

main()
