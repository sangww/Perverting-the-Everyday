# Perverting the Everyday

An online archive of speculative appliances. The homepage introduces the workshop and links to an Apple-style storefront for every product in the catalogue.

## Add a product

1. Copy the entire [Nearlight folder](products/nearlight) to a new folder under `products/`. Use a short lowercase folder name with hyphens, such as `homesick-kettle`. That name becomes the page URL.
2. Edit `product.json` in the new folder. Add the product name, appliance category, one or two short lines of sales copy, and a fictional price. Credit and installment pricing are optional.
3. Drop images into the same folder. Set `hero` to the main image filename and list the other filenames in each section's `images` array. PNG, JPEG, WebP, AVIF, GIF, and SVG are supported. Image descriptions are optional.
4. Commit the folder to `main` when ready. The next build adds the catalogue card and creates `/products/homesick-kettle/` automatically.

During the workshop, teams can hand their completed folders to the facilitator for a single batch commit. The storefront's Order button opens a fictional purchase notice.

Each entry in `sections` has a title, paragraph, and image list. Add, remove, or rearrange sections and images in the order they should appear. Use `[]` for a text-only section's image list or for a product with no additional sections.

```json
{
  "title": "The kettle calls back",
  "images": ["kettle-at-night.png", "kettle-on-the-phone.png"],
  "text": "Every evening, it repeats the last sound it heard before boiling."
}
```

To include an image description, use an object such as `{"image": "kettle-at-night.png", "alt": "A kettle glows on a dark kitchen counter."}` in place of the filename.

## Add the collection photograph

Drop a single image called `collection.jpg`, `collection.png`, or another supported `collection.<extension>` into `site/assets/`. It automatically replaces the illustrated placeholder on the homepage.

## Preview

With Node.js 22 installed, run:

```sh
npm run build
npm run preview
```

Open <http://127.0.0.1:4173/>. Rerun the build after editing content. No dependency installation is needed.

## Publish with GitHub Pages

1. Push the project to the repository's `main` branch.
2. In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. In **Actions**, run **Deploy catalogue to GitHub Pages**. Open the URL in the deployment job once it succeeds. Future pushes to `main` trigger the workflow automatically.

The workflow builds into `dist/` and publishes that directory. GitHub's [Pages publishing source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) covers the one-time setup.
