/**
 *  To get started, make sure you have Node version >8 installed
 * `npm install` or `yarn install` to install dependencies
 * `npm start` to run the app
 **/

const puppeteer = require("puppeteer");
const HOMEPAGE = "https://www.propelleraero.com";

const BLOG_TITLE_LINK = "body > div.wrap.container > div > main > section.vc_section.blog-block.block-page.wpb_animate_when_almost_visible.wpb_fadeIn.fadeIn.vc_custom_1488378316449.wpb_start_animation.animated > div > div > div > div > div.vc_grid-container-wrapper.vc_clearfix > div > div.vc_grid.vc_row.vc_grid-gutter-30px.vc_pageable-wrapper.vc_hook_hover > div.vc_pageable-slide-wrapper.vc_clearfix > div:nth-child(INDEX) > div.vc_grid-item-mini.vc_clearfix > div.vc_gitem-animated-block > div > a";

const BLOG_ENTRY_CONTENT = "body > div.wrap.container > div > main > article > div";

(async () => {
    // launch puppeteer ({headless: true} runs without opening chrome)
    const browser = await puppeteer.launch({ headless: false });
    // create a new page
    const page = await browser.newPage();
    // navigate to the homepage
    await page.goto(HOMEPAGE + '/blog');

    // do your scraping here
    let stats = {
    	max: {
    		title: "",
    		words: "",
    	},
    	posts: [],
    }

    // Get total number of blog posts and then iterate through them
    const numPosts = await page.$$eval('a.read-more', result => result.length);
    for (let i = 1; i <= numPosts; i++) {
    	
    	// Collect title 
    	const title = await page.evaluate(input => {
    		return document.querySelector(input).getAttribute('title');
    	}, BLOG_TITLE_LINK.replace("INDEX", i))
    	
    	// Collect URLs
    	const url = await page.evaluate(input => {
    		return document.querySelector(input).getAttribute('href');
    	}, BLOG_TITLE_LINK.replace("INDEX", i))
    	
    	// Navigate to the URLs in a new page, scrape the main content and count the words
    	const newPage = await browser.newPage();
    	await newPage.goto(url);

    	let wordCount = await newPage.evaluate(input => {
    		// Recursive function to traverse down the nodes of the div and collect the words within
    		const recursiveCount = (element) => {
    			let words = ""
    			for (let i=0; i<element.childNodes.length; i++) {
    				const node = element.childNodes[i];
    				// recurse down the element nodes till we eventually can extract the node's value (ie the words)
            if (node.nodeType != 1) {
            	words += node.nodeValue;
            } else {
            	words += recursiveCount(node);
            }
    			}
    			return words;
    		}

    		// Once we have the words for that blog post we split them based on spaces
    		// Return the length of that array to get the number of words in that blog post
    		const result = recursiveCount(document.querySelector(input));
    		return result.split(/\s+/).length;
    	}, BLOG_ENTRY_CONTENT);
    	// Close the page after scraping each blog post
    	await newPage.close();

    	// Store all the collected data in an object and push into our array
    	const post = {
    		title: title,
    		words: wordCount,
    	}
    	stats.posts.push(post);

    	// Update the max post 
    	if (wordCount > stats.max.words) {
    		stats.max = post;
    	}
    	console.log(`${title}\n${wordCount} words\n`);
    } 
    // Finally display the post with the most words
    console.log(`\n${stats.max.title}\nhas the most words at ${stats.max.words}\n`);
    // close the browser
    await browser.close();


})();