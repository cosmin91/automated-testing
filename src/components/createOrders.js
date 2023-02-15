import { Cluster } from 'puppeteer-cluster'
import { delay } from '../utils/delay.js'
import { isURL } from '../utils/isURL.js'
import { pickRandom } from '../utils/randomArrayElement.js'

const createOrder = (async ({ browser, page, data: url }) => {

    if(!isURL(url)) return

    await delay(pickRandom([1000, 2000, 3000, 4000]))
    await page.goto(url)    
    await page.setViewport({ width: 1080, height: 1024 })

    // Set screen size

    // Locate the full title with a unique string
    await page.waitForSelector(
        'text/Read more'
    )    
    await delay(1000)    
    const [buyNow] = await page.$x("//button[contains(., 'Buy now')]")    

    if (buyNow) {
        await buyNow.click()
        await delay(100)
        await page.waitForSelector('.main__content', { visible: true, timeout: 0 })
    }    

    const defaultOrExp = Math.floor(Math.random() * 10) == 8
    if (defaultOrExp && page.url().indexOf('?access_token') !== -1) {
        await page.goto(page.url().split('?access_token')[0])
        await delay(100)
        await page.waitForSelector('.main__content', { visible: true, timeout: 0 })
    }

    // Insert user information on the checkout page
    await page.type('[type="email"]', 'joe.doe.91.test@sdx.com')
    await page.type('[name="checkout[shipping_address][first_name]"]', 'John')
    await page.type('[name="checkout[shipping_address][last_name]"]', 'Doe')
    await page.type('[name="checkout[shipping_address][address1]"]', '22 Monks Park')
    await page.type('[name="checkout[shipping_address][city]"]', 'Wembley')
    await page.type('[name="checkout[shipping_address][zip]"]', 'HA96JL')


    await delay(100)

    const [continueToShipping] = await page.$x("//button[contains(., 'Continue to shipping')]")

    if (continueToShipping) {
        await continueToShipping.click()
        await delay(100)
        await page.waitForSelector(
            'text/Continue to payment'
        )
        await page.waitForSelector('.main__content', { visible: true, timeout: 0 })
    }

    await delay(100)

    const [continueToPayment] = await page.$x("//button[contains(., 'Continue to payment')]")

    if (continueToPayment) {
        await continueToPayment.click()
        await delay(3000)
        await page.waitForSelector(
            'text/Pay now'
        )
        await page.waitForSelector('.main__content', { visible: true, timeout: 0 })
        const checkoutCardNumberFrameHandler = await page.waitForSelector('.card-fields-container .fieldset .field:nth-child(0n+2) iframe')
        const checkoutCardNumberFrame = await checkoutCardNumberFrameHandler.contentFrame()
        const checkoutCardNameFrameHandler = await page.waitForSelector('.card-fields-container .fieldset .field:nth-child(0n+3) iframe')
        const checkoutCardNameFrame = await checkoutCardNameFrameHandler.contentFrame()
        const checkoutCardExpiryDateFrameHandler = await page.waitForSelector('.card-fields-container .fieldset .field:nth-child(0n+4) iframe')
        const checkoutCardExpiryDateFrame = await checkoutCardExpiryDateFrameHandler.contentFrame()
        const checkoutCardSecurityFrameHandler = await page.waitForSelector('.card-fields-container .fieldset .field:nth-child(0n+5) iframe')
        const checkoutCardSecurityFrame = await checkoutCardSecurityFrameHandler.contentFrame()
        await delay(100)
        await checkoutCardNumberFrame.type('#number', '1', { delay: 100 })
        await checkoutCardNameFrame.type('#name', 'Test', { delay: 100 })
        await checkoutCardExpiryDateFrame.type('#expiry', '12/28', { delay: 100 })
        await checkoutCardSecurityFrame.type('#verification_value', '123', { delay: 100 })
    }

    await delay(100)

    const [payNow] = await page.$x("//button[contains(., 'Pay now')]")

    if (payNow) {
        await payNow.click()

        let isOrderConfirmationPage = page.url().indexOf('thank_you') !== -1
        let tryToLoad = 0

        while (!isOrderConfirmationPage) {
            await delay(1000)

            isOrderConfirmationPage = page.url().indexOf('thank_you') !== -1
            tryToLoad++
            if (tryToLoad > 9000) {

                isOrderConfirmationPage = true
            }
        }


        resolve()
    }

    await browser.close()

    return true

})

export const createClusterForOrders = (async (totalOrders, links, campaigns) => {

    if (totalOrders <= 0) {
        return
    }

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

    [...Array(totalOrders).keys()].map(async () => {
        const experienceBase = pickRandom(links)
        const randomCampaign = pickRandom(campaigns)
        const randomChannel = pickRandom(randomCampaign.channels)
        const medium = randomChannel === 'Email' ? 'email' : 'social'
        const utmLink = `&utm_source=${randomChannel}&utm_medium=${medium}&utm_campaign=${randomCampaign.campaign}`

        await cluster.queue(`${experienceBase}${utmLink}`, createOrder)
    })

    await cluster.idle()

    await cluster.close()

    await delay(2000)

})