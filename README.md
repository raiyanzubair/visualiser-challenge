- Clone this repo.
- Run `npm install` to install dependencies.
- Run `npm start` or `node index` to start it.
- It will iterate through each blog post from `https://www.propelleraero.com/blog` and display the title and number of words in the blog post to the command line. (This may take a little while)
- Once it is done it will output the blog post with the most words to the command line. 
- If any errors occur or it freezes or times out, try re-running it. It should work eventually :)



I would have liked to go through the blog posts concurrently and collect their word counts, but did not know how to tackle that in the problem's current state and avoid race conditions.