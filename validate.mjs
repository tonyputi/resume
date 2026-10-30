import { readFile } from 'node:fs/promises'
import resumeSchema from '@jsonresume/schema'

const file = process.argv[2] ?? 'resume.json'

try {
  const resume = JSON.parse(await readFile(file, 'utf8'))
  resumeSchema.validate(resume, (errors, valid) => {
    if (!valid) {
      console.error(`${file}: invalid JSON Resume`)
      for (const error of errors) {
        console.error(`  ${error.property}: ${error.message}`)
      }
      process.exitCode = 1
      return
    }
    console.log(`Validated ${file} against JSON Resume schema`)
  })
} catch (error) {
  console.error(`${file}: ${error.message}`)
  process.exitCode = 1
}
