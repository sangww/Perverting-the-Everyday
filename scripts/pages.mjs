const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character])

function image(path, alt = '', className, lazy = false) {
  return `<img class="${className}" src="${escape(path)}" alt="${escape(alt)}"${lazy ? ' loading="lazy"' : ''}>`
}

function layout(title, description, base, header, content, script = '') {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(description)}">
  <title>${escape(title)}</title>
  <link rel="stylesheet" href="${base}assets/styles.css">
  ${script}
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  ${header}
  <main id="main">${content}</main>
  <footer><div class="frame"><a href="${base}">Perverting the Everyday</a><span>A catalogue of fictional appliances.</span></div></footer>
</body>
</html>`
}

export function catalogue(products, collectionImage) {
  const cards = products.map(product => `
    <li><a class="card" href="./products/${product.slug}/">
      ${image(`./products/${product.slug}/${product.hero.image}`, '', 'card-image', true)}
      <div class="card-body"><div><p class="eyebrow">${escape(product.category)}</p><h3>${escape(product.name)}</h3>
      <p>${escape(product.pitch.join(' '))}</p></div><span aria-hidden="true">↗</span></div>
    </a></li>`).join('')
  const header = `<header class="top"><nav class="frame" aria-label="Main">
    <a class="wordmark" href="./">Perverting the Everyday</a>
    <div class="nav-links"><a href="#catalogue">Catalogue</a><a href="#workshop">Workshop</a></div>
  </nav></header>`
  return layout('Perverting the Everyday', 'Co-speculating a strange product catalogue.', './', header, `
    <section class="frame home-intro">
      <p class="eyebrow">A speculative product catalogue</p>
      <h1>Perverting<br>the Everyday<span class="accent">.</span></h1>
      <p class="intro-copy">What happens when the smart appliances in our homes develop habits of their own?</p>
    </section>
    <figure class="frame collection">
      ${collectionImage
        ? image(`./assets/${collectionImage}`, 'The collection of speculative appliances', 'collection-image')
        : '<div class="collection-placeholder"><img src="./assets/collection-placeholder.svg" alt=""><span>Collection photograph forthcoming</span></div>'}
    </figure>
    <section class="frame catalogue" id="catalogue">
      <div class="section-heading"><div><p class="eyebrow">The archive</p><h2>Browse the catalogue</h2></div><span class="count">${products.length} ${products.length === 1 ? 'appliance' : 'appliances'}</span></div>
      ${cards ? `<ul class="grid">${cards}</ul>` : '<p>The catalogue opens when the first appliance arrives.</p>'}
    </section>
    <section class="workshop" id="workshop"><div class="frame workshop-grid">
      <div><p class="eyebrow">About the workshop</p><h2>Co-speculating a strange product catalogue</h2>
      <p>Inspired by <em>Perversion of Interfaces</em>, we take familiar appliances and imagine how they might misbehave, ask for attention, or leave traces in our homes. Working in small groups, we pitch a device, rethink its lifecycle, and turn it into a faux product page for this collective archive.</p>
      <p>2.5 hours · Bring a laptop if you can.</p></div>
      <ol class="agenda"><li><span>Intro and conversation</span><span>20 min</span></li>
      <li><span>Product pitch</span><span>20 min</span></li>
      <li><span>Concept development in groups</span><span>60 min</span></li>
      <li><span>All-hands review</span><span>20 min</span></li>
      <li><span>Finalization and launch celebration</span><span>30 min</span></li></ol>
    </div></section>`)
}

export function productPage(product) {
  const name = escape(product.name)
  const { sections } = product
  const header = `<header class="top product-top"><nav class="frame" aria-label="Product">
    <div class="product-name"><a class="back" href="../../#catalogue"><span aria-hidden="true">‹</span> Catalogue</a><span class="wordmark">${name}</span></div>
    <a href="#order" class="nav-order">Order</a>
  </nav></header>`
  return layout(`${product.name} · Perverting the Everyday`, product.pitch.join(' '), '../../', header, `
    <section class="product-hero frame" aria-labelledby="product-title">
      <p class="eyebrow">${escape(product.category)}${product.credit ? ` · ${escape(product.credit)}` : ''}</p>
      <h1 id="product-title">${name}</h1>
      <p class="pitch">${product.pitch.map(line => `<span>${escape(line)}</span>`).join('')}</p>
      ${image(`./${product.hero.image}`, product.hero.alt, 'hero-image')}
      <div class="order" id="order">
        <button class="buy" type="button" data-order>Order now</button>
        <p>From <strong>${escape(product.price)}</strong>${product.installment ? ` or ${escape(product.installment)}` : ''}</p>
      </div>
    </section>
    ${sections.length ? `<nav class="stage-nav frame" aria-label="Product sections">${sections.map(section =>
      `<a href="#${section.id}">${escape(section.label ?? section.title)}</a>`
    ).join('')}</nav>` : ''}
    <div class="frame lifecycle">
      ${sections.map((section, index) => {
        const number = String(index + 1).padStart(2, '0')
        return `<section id="${section.id}" class="stage">
          <p class="eyebrow">${number}${section.label ? ` / ${escape(section.label)}` : ''}</p>
          <h2>${escape(section.title)}</h2>
          ${section.images.map(entry => image(`./${entry.image}`, entry.alt, 'stage-image', true)).join('\n')}
          <p class="stage-copy">${escape(section.text)}</p>
        </section>`
      }).join('')}
    </div>
    <dialog aria-labelledby="order-title">
      <p class="eyebrow">Fictional storefront</p><h2 id="order-title">${name}</h2>
      <p>This appliance exists in the world of the workshop. There’s no purchase to complete.</p>
      <form method="dialog"><button class="buy">Back to the product</button></form>
    </dialog>`, '<script src="../../assets/order.js" defer></script>')
}
