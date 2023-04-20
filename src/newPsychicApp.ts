import * as fs from 'fs'
import * as c from 'colorette'
import ConfBuilder from './confBuilder'
import copyRecursive from './copyRecursive'
import EnvBuilder from './envBuilder'
import sspawn from './sspawn'
import logo from './logo'
import log from './log'
import sleep from './sleep'

export default async function newHowlApp(
  appName: string,
  {
    api = false,
    ws = false,
    redis = false,
    uuids = false,
  }: {
    api?: boolean
    ws?: boolean
    redis?: boolean
    uuids?: boolean
  }
) {
  log.clear()
  log.write(logo() + '\n\n', { cache: true })
  log.write(c.magentaBright(`Installing psychic framework to ./${appName}`), { cache: true })
  log.write(c.blue(`Step 1. writing boilerplate to ${appName}...`))
  let projectPath: string
  let rootPath = `./${appName}`
  if (api) {
    projectPath = `./${appName}`
    copyRecursive(__dirname + '/../boilerplate/api', `./${appName}`)
  } else {
    projectPath = `./${appName}/api`
    copyRecursive(__dirname + '/../boilerplate', `./${appName}`)
  }

  log.restoreCache()
  log.write(c.blue(`Step 1. write boilerplate to ${appName}: Done!`), { cache: true })
  log.write(c.blueBright(`Step 2. building default config files...`))
  fs.writeFileSync(`${projectPath}/.env`, EnvBuilder.build({ appName, env: 'development' }))
  fs.writeFileSync(`${projectPath}/.env.test`, EnvBuilder.build({ appName, env: 'test' }))

  fs.writeFileSync(
    projectPath + '/src/conf/app.yml',
    ConfBuilder.buildAll({
      api,
      ws,
      redis,
      uuids,
    })
  )

  log.restoreCache()
  log.write(c.blueBright(`Step 2. build default config files: Done!`), { cache: true })
  log.write(c.cyan(`Step 3. Installing psychic dependencies...`))
  await sspawn(`cd ${projectPath} && yarn install`)

  log.restoreCache()
  log.write(c.cyan(`Step 3. Install psychic dependencies: Done!`), { cache: true })
  log.write(c.cyanBright(`Step 4. Initializing git repository...`))
  await sspawn(`cd ./${appName} && git init`)
  await sspawn(`cd ./${appName} && git add --all && git commit -m 'psychic init'`)

  log.restoreCache()
  log.write(c.cyanBright(`Step 4. Initialize git repository: Done!`), { cache: true })
  log.write(c.greenBright(`Step 5. Building project...`))
  await sspawn(`yarn --cwd=${projectPath} dream sync:existing`)
  await sspawn(`yarn --cwd=${projectPath} sync`)

  if (!api) {
    await sspawn(`yarn --cwd=${rootPath}/client install`)
  }

  log.restoreCache()
  log.write(c.greenBright(`Step 5. Build project: Done!`), { cache: true })
  const helloMessage = `
      finished! cd into ${appName} to get started

      to create a database,
        $ psy db:create
        $ NODE_ENV=test psy db:create

      to migrate a database,
        $ psy db:migrate
        $ NODE_ENV=test psy db:migrate

      to rollback a database
        $ psy db:rollback
        $ NODE_ENV=test psy db:rollback

      to drop a database
        $ psy db:drop
        $ NODE_ENV=test psy db:drop

      to create a resource (model, migration, serializer, and controller)
        $ psy g:resource user-profile user:belongs_to likes_chalupas:boolean some_id:uuid

        # NOTE: doing it this way, you will still need to
        # plug the routes manually in your conf/routes.ts file

      to create a model
        $ psy g:model user-profile user:belongs_to likes_chalupas:boolean some_id:uuid

      to create a migration
        $ psy g:migration create-user-profiles

      to start a dev server at localhost:7777,
        $ psy dev

      to run unit tests,
        $ psy uspec

      to run feature tests,
        $ psy fspec

      to run unit tests, and then if they pass, run feature tests,
        $ psy spec

      # NOTE: before you get started, be sure to visit your .env and .env.test
      # files and make sure they have database credentials set correctly.
      # you can see conf/db.js to see how those credentials are used.
  `
  console.log(helloMessage)
}
