'use strict';

import { createClusterForBounceEvent } from "./src/components/createBounceEvents.js"
import { createClusterForOrders } from "./src/components/createOrders.js"
import * as cron from 'node-cron'
import { env } from "./env.js";

const campaigns = [
    { campaign: 'Ad Campaign', channels: ['Instagram', 'Facebook'] },
    { campaign: 'Sale Campaign', channels: ['TikTok', 'Instagram'] },
    { campaign: 'Creator Promotion', channels: ['TikTok'] },
    { campaign: 'Boosted Post', channels: ['Instagram', 'Facebook'] },
    { campaign: 'Retargeting', channels: ['Facebook', 'Email'] },
]

let averageOrdersPerHour = parseInt((Math.floor(Math.random() * 144) + 168) / 24)

cron.schedule('0 0 * * *', () => {
    // reset total number of orders every day
    averageOrdersPerHour = parseInt((Math.floor(Math.random() * 144) + 168) / 24)
})

cron.schedule('0 * * * *', () => {
    // every hour at minute 0
    if (!env.experiences) return
    // https://krave-demo.social.dev.simplicitydx.io/?exp-id=wFVF4fS9VYiG&p=s&s=krave-demo,https://krave-demo.social.dev.simplicitydx.io/?exp-id=oR8cJyNB5Qyl&p=s&s=krave-demo,https://krave-demo.social.dev.simplicitydx.io/?exp-id=oZK0DWVO9nRj&p=s&s=krave-demo,https://krave-demo.social.dev.simplicitydx.io/?exp-id=vQQNU0WAGRoa&p=s&s=krave-demo,https://krave-demo.social.dev.simplicitydx.io/?exp-id=HSLf3acu4Yrk&p=s&s=krave-demo,https://krave-demo.social.dev.simplicitydx.io/?exp-id=eXW7f7RClDqW&p=s&s=krave-demo,https://krave-demo.social.dev.simplicitydx.io/?exp-id=HIML3YbylHDS&p=s&s=krave-demo
    const storefrontsLinks = env.storefrontsLinks.split(',')
    createClusterForOrders(averageOrdersPerHour, storefrontsLinks, campaigns)
})

cron.schedule('5 * * * *', () => {
    // every hour at minute 5
    if (!env.brandSiteProducts) return
    // https://krave-demo.myshopify.com/products/great-barrier-relief,https://krave-demo.myshopify.com/products/great-body-relief,https://krave-demo.myshopify.com/products/kale-lalu-yaha,https://krave-demo.myshopify.com/products/bff-bundle
    const brandSiteProducts = env.brandSiteProducts.split(',')
    createClusterForBounceEvent(brandSiteProducts)
})