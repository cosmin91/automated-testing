import { Cluster } from 'puppeteer-cluster'
import { delay } from '../utils/delay.js'
import { pickRandom } from '../utils/randomArrayElement.js'

const createBounceEventOnBrandSite = (async ({ page, data: url }) => {

    if(!isURL(url)) return

    await delay(pickRandom([1000, 2000, 3000, 4000]))
    await page.goto(url)
    await page.setViewport({ width: 1080, height: 1024 })

    const storePassword = await page.$x("//label[contains(., 'Enter store password')]")
    if (storePassword) {
        await page.type('input#password', 'demo')

        const [enter] = await page.$x("//button[contains(., 'Enter')]")
        await enter.click()
        await delay(3000)
        await page.goto(url)
    }

    await delay(3000)

    return true
})

export const createClusterForBounceEvent = (async (brandSiteProducts) => {

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_BROWSER, // spawn to parallel browsers
        maxConcurrency: 4, // how many tasks should be run concurrently
        puppeteerOptions: {
            headless: true,
            args:[
                '--no-sandbox'
            ]
        },
    });

    brandSiteProducts.map(async (productURL) => {
        await cluster.queue(productURL, createBounceEventOnBrandSite)
    })

    await cluster.idle()
    await cluster.close()

})