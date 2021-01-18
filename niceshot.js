const puppeteer = require('puppeteer')

async function capture(url, options) {
    const { filename, selector } = options

    const browser = await puppeteer.launch({args: ['--no-sandbox', '--font-render-hinting=none']});
    const page = await browser.newPage();

    page.setViewport({
        width: 1200,
        height: 1200,
        deviceScaleFactor: 1
    });

    console.log(`Navigating to ${url}`)

    await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 1000 * 60 * 2
    })

    /**
     * Takes a screenshot of a DOM element on the page, with optional padding.
     *
     * @param {!{path:string, selector:string, padding:(number|undefined)}=} opts
     * @return {!Promise<!Buffer>}
     */
    async function screenshotDOMElement(opts = {}) {
        const padding = 'padding' in opts ? opts.padding : 0;
        const path = 'path' in opts ? opts.path : null;
        const selector = opts.selector;

        if (!selector)
            throw Error('Please provide a selector.');

        const rect = await page.evaluate(selector => {
            const element = document.querySelector(selector);
            if (!element)
                return null;
            const {x, y, width, height} = element.getBoundingClientRect();
            return {left: x, top: y, width, height, id: element.id};
        }, selector);

        if (!rect)
            throw Error(`Could not find element that matches selector: ${selector}.`);

        return await page.screenshot({
            path,
            clip: {
                x: rect.left - padding,
                y: rect.top - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2
            }
        });
    }

    console.log('Awaiting event')

    try {
        await page.waitForSelector(selector, {
            timeout: 10 * 1000
        })
    } catch (err) {
        browser.close()

        return
    }

    await screenshotDOMElement({
        path: `tmp/${filename}`,
        selector
    });

    browser.close();
}

module.exports = {
    capture
}
