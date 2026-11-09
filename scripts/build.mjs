import { cp, lstat, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { catalogue, productPage } from './pages.mjs'

const root = new URL('../', import.meta.url)
const site = new URL('site/', root)
const source = new URL('products/', root)
const output = new URL('dist/', root)
const legacyStages = {
  relationship: 'The relationship',
  trace: 'The trace',
  maintenance: 'The maintenance',
  afterlife: 'The afterlife'
}
const imageName = /^[a-z0-9][a-z0-9._-]*\.(avif|gif|jpe?g|png|svg|webp)$/i

function required(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${field}`)
}

async function checkImage(entry, field, folder) {
  const image = typeof entry === 'string' ? { image: entry } : entry
  required(image?.image, field)
  if (!imageName.test(image.image)) throw new Error(`Use a local image filename for ${field}`)
  if (!(await stat(new URL(image.image, folder))).isFile()) throw new Error(`Invalid image: ${image.image}`)
  return image
}

const products = []
const folders = await readdir(source, { withFileTypes: true })
for (const { name: slug } of folders.filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
  try {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Use a lowercase, hyphenated folder name')
    const folder = new URL(`${slug}/`, source)
    const product = JSON.parse((await readFile(new URL('product.json', folder), 'utf8')).replace(/^\uFEFF/, ''))
    for (const field of ['name', 'category', 'price']) required(product[field], field)
    for (const field of ['credit', 'installment']) {
      if (product[field] !== undefined) required(product[field], field)
    }
    if (!Array.isArray(product.pitch) || product.pitch.length < 1 || product.pitch.length > 2) {
      throw new Error('pitch needs one or two short lines')
    }
    product.pitch.forEach(line => required(line, 'pitch line'))
    const hero = await checkImage(product.hero, 'hero', folder)
    const sections = []
    if (product.sections === undefined) {
      for (const [id, label] of Object.entries(legacyStages)) {
        const section = product[id]
        if (id === 'afterlife' && section === undefined) continue
        const image = await checkImage(section, id, folder)
        required(section.title, `${id}.title`)
        required(section.text, `${id}.text`)
        sections.push({ id, label, title: section.title, text: section.text, images: [image] })
      }
    } else {
      if (!Array.isArray(product.sections)) throw new Error('sections must be an array')
      for (const [index, section] of product.sections.entries()) {
        const field = `sections[${index}]`
        required(section?.title, `${field}.title`)
        required(section.text, `${field}.text`)
        if (!Array.isArray(section.images)) throw new Error(`${field}.images must be an array`)
        const images = await Promise.all(section.images.map((image, index) =>
          checkImage(image, `${field}.images[${index}]`, folder)
        ))
        sections.push({ id: `section-${index + 1}`, title: section.title, text: section.text, images })
      }
    }
    products.push({ ...product, slug, hero, sections })
  } catch (error) {
    throw new Error(`products/${slug}/: ${error.message}`, { cause: error })
  }
}

const collectionImages = (await readdir(new URL('assets/', site), { withFileTypes: true }))
  .filter(entry => entry.isFile() && /^collection\./.test(entry.name) && imageName.test(entry.name))
if (collectionImages.length > 1) throw new Error('Keep a single collection image in site/assets/')

const existing = await lstat(output).catch(error => {
  if (error.code !== 'ENOENT') throw error
})
if (existing?.isSymbolicLink()) throw new Error('dist/ must be a regular directory')
await rm(output, { recursive: true, force: true })
await cp(site, output, { recursive: true })
await writeFile(new URL('index.html', output), catalogue(products, collectionImages[0]?.name))
for (const product of products) {
  const directory = new URL(`products/${product.slug}/`, output)
  const folder = new URL(`${product.slug}/`, source)
  await mkdir(directory, { recursive: true })
  await writeFile(new URL('index.html', directory), productPage(product))
  const images = [product.hero, ...product.sections.flatMap(section => section.images)]
  for (const filename of new Set(images.map(image => image.image))) {
    await cp(new URL(filename, folder), new URL(filename, directory))
  }
}
console.log(`Built catalogue with ${products.length} product page(s) in dist/.`)
